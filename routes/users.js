const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const passport = require('passport');

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
            User.create({
              name: req.body.name,
              email: req.body.email,
              username: req.body.username,
              password: hash
            }).then(() => {
              req.flash('success', 'Account created!');
              res.redirect('/');
            }).catch((err) => console.log(err));
          }
        });
      }
    });
  }
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