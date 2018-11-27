const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const crypto = require('crypto');

// Import register mail template
const registerMail = require('../mailer/register');
// Import password recovery mail template
const passwordRecoveryMail = require('../mailer/passwordRecovery');
const newPasswordMail = require('../mailer/newPassword');

// Import User and Article models
const User = require('../database/models').User;
const Article = require('../database/models').Article;

// Register form
router.get('/register', (req, res) => {
  res.render('register');
});

// Create user
router.post('/register', [
  check('name', 'Name is required!').not().isEmpty(),
  check('name', 'Name must have beetween 5 and 20 characters length').isLength({ min: 5, max: 20 }),
  check('email', 'Email is required!').not().isEmpty(),
  check('email', 'Email is not valid!').isEmail(),
  check('email').custom(value => {
    return User.findOne({
      attributes: ['email'],
      where: {
        email: value
      }
    }).then(user => {
      if (user) {
        return Promise.reject('Email already in use');
      }
    });
  }),
  check('username', 'Username is required!').not().isEmpty(),
  check('username', 'Username must have between 5 and 20 characters length').isLength( { min: 5, max: 20 }),
  check('username').custom(value => {
    return User.findOne({
      attributes: ['username'],
      where: {
        username: value
      }
    }).then(user => {
      if (user) {
        return Promise.reject('Username already in use');
      }
    });
  }),
  check('password', 'Password is required!').not().isEmpty(),
  check('password', 'Password must have at least 8 characters').isLength({ min: 8 }),
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

// Password recovery email
router.get('/recovery', (req, res) => {
  if (req.user) {
    res.redirect('/');
  } else {
    res.render('recovery');
  }
});

router.post('/recovery', (req, res) => {
  // Check if email address exists in database
  if (req.body.email.length === 0) {
    res.render('recovery', {
      error: 'Incorrent email'
    });
  } else {
    User.findOne({
      where: {
        email: req.body.email
      }
    }).then((user) => {
      if (user) {
        // Check if user account is active
        if (user.dataValues.isAccountActive === true) {
          // Create token for password recovery
          function createPasswordRecoveryToken() {
            let token = crypto.randomBytes(64).toString('hex');
            // Check if token already exists
            User.findOne({
              attributes: ['passwordRecoveryToken'],
              where: {
                passwordRecoveryToken: token
              }
            }).then(user => {
              // If not, send mail with token
              if (!user) {
                let date = new Date();
                let timeNow = date.getTime();
                // Set one hour before token expires
                let expireDate = date.setTime(timeNow + 1000 * 3600);
                User.update({
                  passwordRecoveryToken: token,
                  expirePasswordRecovery: expireDate,
                  isRecoveryTokenUsed: false
                }, {
                  where: {
                    email: req.body.email
                  }
                }).then(() => {
                  passwordRecoveryMail(req.body.email, token);
                  req.flash('success', 'Email has been sent!');
                  res.redirect('/');
                }).catch(err => console.log(err));
              } else {
                // Token exists in database, create token once again
                createPasswordRecoveryToken();
              }
            }).catch(err => console.log(err));
          }
          createPasswordRecoveryToken();
        } else {
          res.render('recovery', {
            error: 'You must activate your account first!'
          });
        }
      } else {
        res.render('recovery', {
          error: "Couldn't find your email address in a database"
        });
      }
    }).catch(err => console.log(err));
  }
});

// Password recovery - new password
router.get('/recovery/:hash', (req, res) => {
  User.findOne({
    where: {
      passwordRecoveryToken: req.params.hash
    }
  }).then(user => {
    // Check if recovery hash exists
    if (user) {
      let currentTime = new Date();
      // Check if recovery token expired
      if (user.dataValues.expirePasswordRecovery < currentTime) {
        req.flash('warning', 'Link to your password change has expired. Try once again');
        res.redirect('/users/recovery');
      } else if (user.dataValues.isRecoveryTokenUsed) {
        req.flash('warning', 'Error. This token has been used.');
        res.redirect('/users/recovery');
      } else {
        res.render('password_recovery', {
          hash: req.params.hash
        });
      }
    } else {
      // If recovery token expired - redirect to home page
      res.redirect('/');
    }
  }).catch(err => console.log(err));
});


// Password recovery - update user password
router.post('/recovery/:hash', [
  check('password', 'Password is required').not().isEmpty(),
  check('password', 'Password must have at least 8 characters').isLength({ min: 8 }),
  check('password2', 'Passwords do not match!').exists().custom((value, { req }) => {
    return value === req.body.password;
  })
], (req, res) => {
  let errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Prevent from passing undefined hash to rerender when password does not pass the validation
    res.render('password_recovery', {
      errors: errors.array(),
      hash: req.params.hash
    });
  } else {
    // Check if new password is the same as the old password
    User.findOne({
      where: {
        passwordRecoveryToken: req.params.hash
      }
    }).then(user => {
      if (user) {
        bcrypt.compare(req.body.password, user.dataValues.password, (err, isMatch) => {
          if (err) {
            return console.log(err);
          }
          if (isMatch) {
            req.flash('warning', 'New password cannot be the same as the old!');
            res.redirect(`/users/recovery/${req.params.hash}`);
          } else {
            let currentTime = new Date();
            // Variable which store user email, needed to avoid additional query to database
            let userEmail = user.dataValues.email;
            // Check if password recovery token is still active (user is afk)
            if (user.dataValues.expirePasswordRecovery < currentTime) {
              req.flash('warning', 'Link to your password change has expired. Try once again');
              res.redirect('/users/recovery');
            } else {
              bcrypt.genSalt(10, (err, salt) => {
                if (err) {
                  console.log(err);
                } else {
                  // Hash new password if no errors
                  bcrypt.hash(req.body.password, salt, (err, hash) => {
                    if (err) {
                      console.log(err);
                    } else {
                      User.update({
                        password: hash,
                        isRecoveryTokenUsed: true
                      }, {
                        where: {
                          passwordRecoveryToken: req.params.hash
                        }
                      }, {
                        fields: ['password', 'isRecoveryTokenUsed']
                      }).then(() => {
                        newPasswordMail(userEmail);
                        req.flash('success', 'Password has been changed, now you can log in');
                        res.redirect('/users/login');
                      }).catch(err => console.log(err));
                    }
                  });
                }
              });
            }
          }
        });
      } else {
        req.flash('warning', 'Something went wrong. Try again');
        res.redirect('/');
      }
    }).catch(err => console.log(err));
  }
});

// Resend email with activation token
router.get('/activation', (req, res) => {
  if (req.user) {
    res.redirect('/');
  } else {
    res.render('activation');
  }
});

router.post('/activation', (req, res) => {
  // Check if email address is not empty
  if (req.body.email.length === 0) {
    res.render('activation', {
      error: 'Incorrect email'
    });
  } else {
    User.findOne({
      where: {
        email: req.body.email
      }
    }).then(user => {
      // Check if user exists
      if (!user) {
        res.render('activation', {
          error: "Couldn't find your email address in a database"
        });
      } else if (user.dataValues.isAccountActive === true) {
        req.flash('warning', 'Your account is already active!');
        res.redirect('/users/login');
      } else {
        registerMail(req.body.email, user.dataValues.username, user.dataValues.mailActivationToken);
        req.flash('success', 'Email has been resend');
        res.redirect('/');
      }
    })
  }
})

// User account
router.get('/account', isUserLogged, (req, res) => {
   res.render('account');
});

// User settings
router.get('/account/settings', isUserLogged, (req, res) => {
  res.render('settings');
});

// Username change
router.get('/account/settings/username', isUserLogged, (req, res) => {
  res.render('change_username');
});

router.post('/account/settings/username', isUserLogged, [
  check('username', 'Username must have between 5 and 20 characters length').isLength({ min: 5, max: 20 }),
  check('username').custom(value => {
    return User.findOne({
      attributes: ['username'],
      where: {
        username: value
      }
    }).then(user => {
      if (user) {
        return Promise.reject('Username already in use!');
      }
    });
  })
], (req, res) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('change_username', {
      errors: errors.array(),
      user: req.user
    });
  } else {
    // Update username
    User.update({
      username: req.body.username
    }, {
      where: {
        id: req.user.id
      }
    }).then(() => {
      req.flash('success', 'Username updated successfully');
      res.redirect('/users/account');
    }).catch(err => console.log(err));
  }
});

// Password change
router.get('/account/settings/password', isUserLogged, (req, res) => {
  res.render('change_password');
});

router.post('/account/settings/password', isUserLogged, [
  check('old_password', 'You must type your current password!').not().isEmpty(),
  check('new_password', 'New password is required').not().isEmpty(),
  check('new_password', 'New password must have at least 8 characters').isLength({ min: 8 }),
  check('new_password2', 'New password do not match').exists().custom((value, { req }) => {
    return value === req.body.new_password;
  })
], (req, res) => {
  // Check if old password is correct
  bcrypt.compare(req.body.old_password, req.user.password, (err, isMatch) => {
    if (err) {
      return console.log(err);
    }
    if (isMatch) {
      // Password correct, further validation
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.render('change_password', {
          errors: errors.array(),
          user: req.user
        });
      } else {
        bcrypt.genSalt(10, (err, salt) => {
          if (err) {
            console.log(err);
          } else {
            // Hash new password if all is ok
            bcrypt.hash(req.body.new_password, salt, (err, hash) => {
              if (err) {
                console.log(err);
              } else {
                User.update({
                  password: hash
                }, {
                  where: {
                    id: req.user.id
                  }
                }, {
                  fields: ['password']
                }).then(() => {
                  req.flash('success', 'Password updated');
                  res.redirect('/users/account/settings');
                }).catch(err => console.log(err));
              }
            });
          }
        });
      }
    } else {
      // Wrong password
      req.flash('warning', 'Incorrect old password');
      res.redirect('/users/account/settings/password');
    }
  });
});

// User social profile
router.get('/profile/:username', (req, res) => {
  User.findOne({
    attributes: ['id', 'username'],
    where: {
      username: req.params.username
    }
  }).then(user => {
    userId = user.dataValues.id;
    Article.findAll({
      where: {
        author: userId
      }
    }).then(articles => {
      res.render('user_articles', {
        articles,
        username: user.dataValues.username
      });
    }).catch(err => console.log(err));
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

// Access control
function isUserLogged(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('warning', 'Access denied');
    res.redirect('/');
  }
}

module.exports = router;