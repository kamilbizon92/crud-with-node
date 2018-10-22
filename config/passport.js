const LocalStrategy = require('passport-local').Strategy;
const { Pool } = require('pg');
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

module.exports = (passport) => {
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, (email, password, done) => {
    // Find email in database
    pool.query('SELECT * FROM users WHERE email=$1', [email], (err, result) => {
      let user = result.rows[0];
      // Connection error
      if (err) {
        return done(null, false, { message: 'Connection error' });
      } else {
        // Check if user exists
        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        } else {
          // Check if password is correct
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
              // If bcrypt threw error
              return done(err);
            }
            // Password correct
            if (isMatch) {
              return done(null, user);
            } else {
              // Incorrect password
              return done(null, false, { message: 'Invalid email or password' });
            }
          });
        }
      }
    });
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    pool.query('SELECT * FROM users WHERE id=$1', [id], (err, result) => {
      done(err, result.rows[0]);
    });
  });
}