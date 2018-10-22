const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { check, validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');

// Set postgresql database
const config = require('../config/database');
const pool = new Pool({
  user: config.user,
  host: config.host,
  database: config.database,
  password: config.password,
  port: config.port
});

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
            pool.query('INSERT INTO users (name, email, username, password) VALUES ($1, $2, $3, $4)', [req.body.name, req.body.email, req.body.username, hash], (err) => {
              if (err) {
                console.log(err);
              } else {
                req.flash('success', 'Account created!');
                res.redirect('/');
              }
            });
          }
        });
      }
    });
  }
});

module.exports = router;