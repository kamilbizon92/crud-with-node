const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Import User model
const User = require('../database/models').User;

module.exports = (passport) => {
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, (email, password, done) => {
    // Find email in database
    User.findOne({ where: { email: email }})
      .then((user) => {
        // Check if user exists
        if (!user) {
          return done(null, false, { message: 'Invalid email or password!' })
        } else {
          // Check if password is correct
          bcrypt.compare(password, user.dataValues.password, (err, isMatch) => {
            if (err) {
              // If bcrypt threw error
              return done(err);
            }
            // Password correct
            if (isMatch) {
              return done(null, user);
            } else {
              // Incorrect password
              return done(null, false, { message: 'Invalid email or password!' });
            }
          });
        }
      })
      .catch(() => {
        return done(null, false, { message: 'Connection error' });
      });
  }));

  passport.serializeUser((user, done) => {
    done(null, user.dataValues.id);
  });

  passport.deserializeUser((id, done) => {
    User.findByPk(id)
      .then((user) => {
        done(null, user.dataValues);
      })
      .catch(err => console.log(err));
  });
}