const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const crypto = require('crypto');

// Import register mail template
const registerMail = require('../mailer/register');

// Import User model
const User = require('../database/models').User;

// Register form
router.get('/register', (req, res) => {
  res.render('register');
});

// Create user
router.post('/register', [
  check('name', 'Name is required!').not().isEmpty(),
  check('email', 'Email is required!').not().isEmpty(),
  check('email', 'Email is not valid!').isEmail(),
  check('username', 'Username is required!').not().isEmpty(),
  check('password', 'Password is required!').not().isEmpty(),
  check('password2', 'Passwords do not match!').exists().custom((value, { req }) => {
    return value === req.body.password;
  })
], (req, res) => {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.render('register', {
      errors: errors.array()
    });
  } else {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        console.log(err);
      } else {
        bcrypt.hash(req.body.password, salt, (err, hash) => {
          if (err) {
            console.log(err);
          } else {
            // Create activation token
            function createActivationToken() {
              let token = crypto.randomBytes(64).toString('hex');
              // Check if token already exists in database
              User.findOne({
                attributes: ['mailActivationToken'],
                where: {
                  mailActivationToken: token
                }
              }).then(user => {
                // If not, create user
                if (!user) {
                  User.create({
                    name: req.body.name,
                    email: req.body.email,
                    username: req.body.username,
                    password: hash,
                    mailActivationToken: token
                  }, {
                    fields: ['name', 'email', 'username', 'password', 'mailActivationToken']
                  }).then(() => {
                    // Generate mail to new user
                    registerMail(req.body.email, req.body.username, token);
                    req.flash('success', 'Account created!');
                    res.redirect('/');
                  }).catch((err) => console.log(err));
                } else {
                  // Token exists in database, create token once again
                  createActivationToken();
                }
              }).catch(err => console.log(err));
            }
            createActivationToken();
          }
        });
      }
    });
  }
});

// Account activation routing
router.get('/register/:hash', (req, res) => {
  User.findOne({
    where: {
      mailActivationToken: req.params.hash
    }
  }).then((user) => {
    if (user.dataValues.isAccountActive) {
      // If account is active - redirect to index page
      res.redirect('/');
    } else {
      // If not - activate with token
      User.update({
        isAccountActive: true
      }, {
        where: {
          id: user.dataValues.id
        }
      }).then(() => {
        req.flash('success', 'Your account now is active. Please log in.');
        res.redirect('/users/login');
      }).catch(err => console.log(err));
    } 
  }).catch(err => console.log(err));
});

// Login form
router.get('/login', (req, res) => {
  res.render('login');
});

// Login process
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.render('login', {
        loginError: info.message
      });
    }
    req.login(user, (err) => {
      if (err){
        return next(err);
      }
      req.flash('success', 'You are logged in');
      res.redirect('/');
    });
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'Come back later');
  res.redirect('/');
});

module.exports = router;