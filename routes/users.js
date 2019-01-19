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
  if (req.user) {
    res.json({
      success: false,
      userLogged: req.isAuthenticated()
    });
  } else {
    res.json({
      success: true,
      userLogged: req.isAuthenticated()
    });
  }
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
        email: value.trim()
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
        username: value.trim()
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
  if (req.user) {
    // If user is logged in, prevent from creating account
    res.json({
      success: false,
      userLogged: req.isAuthenticated()
    });
  } else {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        message: errors.array()
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
                      name: req.body.name.trim(),
                      email: req.body.email.trim(),
                      username: req.body.username.trim(),
                      password: hash,
                      mailActivationToken: token
                    }, {
                      fields: ['name', 'email', 'username', 'password', 'mailActivationToken']
                    }).then(() => {
                      // Generate mail to new user
                      registerMail(req.body.email.trim(), req.body.username.trim(), token);
                      return res.json({
                        success: true,
                        message: 'Account created!'
                      });
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
  }
});

// Account activation routing
router.get('/register/:hash', (req, res) => {
  User.findOne({
    where: {
      mailActivationToken: req.params.hash
    }
  }).then((user) => {
    if (!user) {
      // Invalid token, does not exist in a database
      return res.json({
        success: false,
        message: 'Invalid token'
      });
    } else {
      if (user.dataValues.isAccountActive) {
        // If account is active - redirect to index page
        return res.json({
          success: false,
          message: 'Account is already active'
        });
      } else {
        // If not - activate with token
        User.update({
          isAccountActive: true
        }, {
          where: {
            id: user.dataValues.id
          }
        }).then(() => {
          return res.json({
            success: true,
            message: 'Your account now is active. Please log in.'
          });
        }).catch(err => console.log(err));
      }
    }
  }).catch(err => console.log(err));
});

// Password recovery email
router.get('/recovery', (req, res) => {
  if (req.user) {
    res.json({
      success: false,
      userLogged: req.isAuthenticated()
    });
  } else {
    res.json({
      success: true,
      userLogged: req.isAuthenticated()
    });
  }
});

router.post('/recovery', (req, res) => {
  // Prevent from sending token when user is logged in
  if (req.user) {
    res.json({
      success: false,
      userLogged: req.isAuthenticated(),
      message: 'You are logged in'
    });
  } else {
    // Check if email address exists in database
    if (req.body.email.trim().length === 0) {
      return res.json({
        success: false,
        message: 'Incorrect email'
      });
    } else {
      User.findOne({
        where: {
          email: req.body.email.trim()
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
                      email: req.body.email.trim()
                    }
                  }).then(() => {
                    passwordRecoveryMail(req.body.email.trim(), token);
                    return res.json({
                      success: true,
                      message: 'Email has been sent!'
                    });
                  }).catch(err => console.log(err));
                } else {
                  // Token exists in database, create token once again
                  createPasswordRecoveryToken();
                }
              }).catch(err => console.log(err));
            }
            createPasswordRecoveryToken();
          } else {
            return res.json({
              success: false,
              message: 'You must activate your account first!'
            });
          }
        } else {
          return res.json({
            success: false,
            message: "Couldn't find your email address in a database"
          });
        }
      }).catch(err => console.log(err));
    }
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
        return res.json({
          success: false,
          message: 'Link to your password change has expired. Try once again'
        });
      } else if (user.dataValues.isRecoveryTokenUsed) {
        return res.json({
          success: false,
          message: 'Error. This token has been used.'
        });
      } else {
        return res.json({
          success: true
        });
      }
    } else {
      // If recovery token does not exist - redirect to home page
      return res.json({
        success: false,
        message: 'Recovery token does not exist'
      });
    }
  }).catch(err => console.log(err));
});


// Password recovery - update user password
router.post('/recovery/:hash', [
  check('password', 'Password must have at least 8 characters').isLength({ min: 8 }),
  check('password2', 'Passwords do not match!').exists().custom((value, { req }) => {
    return value === req.body.password;
  })
], (req, res) => {
  let errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Prevent from passing undefined hash to rerender when password does not pass the validation
    return res.json({
      success: false,
      message: errors.array()
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
            return res.json({
              success: false,
              message: [{
                param: 'password2',
                msg: 'New password cannot be the same as the old!'
              }]
            });
          } else {
            let currentTime = new Date();
            // Variable which store user email, needed to avoid additional query to database
            let userEmail = user.dataValues.email;
            // Check if password recovery token is still active (user is afk)
            if (user.dataValues.expirePasswordRecovery < currentTime) {
              return res.json({
                success: false,
                message: 'Link to your password change has expired. Try once again',
                expired: true
              });
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
                        return res.json({
                          success: true,
                          message: 'Password has been changed, now you can log in'
                        });
                      }).catch(err => console.log(err));
                    }
                  });
                }
              });
            }
          }
        });
      } else {
        return res.json({
          success: false,
          message: 'Something went wrong. Try again'
        });
      }
    }).catch(err => console.log(err));
  }
});

// Resend email with activation token
router.get('/activation', (req, res) => {
  if (req.user) {
    res.json({
      success: false,
      userLogged: req.isAuthenticated()
    });
  } else {
    res.json({
      success: true,
      userLogged: req.isAuthenticated()
    });
  }
});

router.post('/activation', (req, res) => {
  // Prevent from sending activation email, when user already has active account and is logged in
  if (req.user) {
    res.json({
      success: false,
      userLogged: req.isAuthenticated(),
      message: 'Your account is already active!'
    });
  } else {
    // Check if email address is not empty
    if (req.body.email.trim().length === 0) {
      return res.json({
        success: false,
        message: 'Incorrect email'
      });
    } else {
      User.findOne({
        where: {
          email: req.body.email.trim()
        }
      }).then(user => {
        // Check if user exists
        if (!user) {
          return res.json({
            success: false,
            message: "Couldn't find your email address in a database"
          });
        } else if (user.dataValues.isAccountActive === true) {
          return res.json({
            success: false,
            message: 'Your account is already active!'
          });
        } else {
          registerMail(req.body.email.trim(), user.dataValues.username, user.dataValues.mailActivationToken);
          return res.json({
            success: true,
            message: 'Email has been send'
          });
        }
      }).catch(err => console.log(err));
    }
  }
})

// User account
router.get('/account', isUserLogged, (req, res) => {
   res.json({
     success: true,
     username: req.user.username,
     userLogged: req.isAuthenticated()
   });
});

// User settings
router.get('/account/settings', isUserLogged, (req, res) => {
  res.json({
    success: true,
    username: req.user.username,
    userLogged: req.isAuthenticated()
  });
});

// Username change
router.get('/account/settings/username', isUserLogged, (req, res) => {
  res.json({
    success: true,
    userLogged: req.isAuthenticated()
  });
});

router.post('/account/settings/username', isUserLogged, [
  check('username', 'Username must have between 5 and 20 characters length').isLength({ min: 5, max: 20 }),
  check('username').custom(value => {
    return User.findOne({
      attributes: ['username'],
      where: {
        username: value.trim()
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
    res.json({
      success: false,
      message: errors.array()
    });
  } else {
    // Update username
    User.update({
      username: req.body.username.trim()
    }, {
      where: {
        id: req.user.id
      }
    }).then(() => {
      res.json({
        success: true,
        message: 'Username updated successfully'
      });
    }).catch(err => console.log(err));
  }
});

// Password change
router.get('/account/settings/password', isUserLogged, (req, res) => {
  res.json({
    success: true,
    userLogged: req.isAuthenticated()
  });
});

router.post('/account/settings/password', isUserLogged, [
  check('old_password', 'You must type your current password!').not().isEmpty(),
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
        res.json({
          success: false,
          message: errors.array()
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
                  res.json({
                    success: true,
                    message: 'Password updated'
                  });
                }).catch(err => console.log(err));
              }
            });
          }
        });
      }
    } else {
      // Wrong password
      res.json({
        success: false,
        message: [{
          param: 'old_password',
          msg: 'Incorrect old password'
        }]
      });
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
    // If user does not exist - redirect to home page
    if (!user) {
      return res.json({
        success: false,
        message: 'User does not exist!'
      });
    } else {
      // If user exists - show all articles on user profile
      userId = user.dataValues.id;
      Article.findAll({
        where: {
          author: userId
        },
        order: [['createdAt', 'DESC']]
      }).then(articles => {
        return res.json({
          success: true,
          userLogged: req.isAuthenticated(),
          message: {
            user: user.dataValues.username,
            articles
          } 
        });
      }).catch(err => console.log(err));
    }
  }).catch(err => console.log(err));
});

// Login form
router.get('/login', (req, res) => {
  if (req.user) {
    res.json({
      success: false,
      userLogged: req.isAuthenticated()
    });
  } else {
    res.json({
      success: true,
      userLogged: req.isAuthenticated()
    });
  }
});

// Login process
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.json({
        success: false,
        message: info.message
      });
    }
    req.login(user, (err) => {
      if (err){
        return next(err);
      }
      
      return res.json({
        success: true,
        user: user
      });
    });
  })(req, res, next);
});

// Logout
router.get('/logout', isUserLogged, (req, res) => {
  req.logout();
  return res.json({
    success: true,
    message: 'Come back later'
  });
});

// Access control
function isUserLogged(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.json({
      success: false,
      message: 'Access denied!'
    });
  }
}

module.exports = router;