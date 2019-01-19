const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

// Import database models
const User = require('../database/models').User;
const Article = require('../database/models').Article;

// Get all articles
router.get('/', (req, res) => {
  Article.findAll({
    order: [['createdAt', 'DESC']]
  }).then((articles) => {
    res.json({
      articles,
      userLogged: req.isAuthenticated()
    });
  }).catch((err) => console.log(err)); 
});

// Form for add article
router.get('/add', isUserLogged, (req, res) => {
  res.json({
    success: true,
    userLogged: req.isAuthenticated()
  });
});

// Add new article
router.post('/add', isUserLogged, [
  check('title', 'Title is required').not().isEmpty(),
  check('body', 'Article must have a body').not().isEmpty()
], (req, res) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({
      success: false,
      message: errors.array(),
      userLogged: req.isAuthenticated()
    });
  } else {
    Article.create({
      title: req.body.title.trim(),
      author: req.user.id,
      body: req.body.body.trim()
    }).then(() => {
        return res.json({
          success: true,
          flash: 'Article added!',
          userLogged: req.isAuthenticated()
        });
    }).catch((err) => console.log(err));
  }
});

// Get single article
router.get('/:id', (req, res) => {
  Article.findByPk(req.params.id)
    .then((article) => {
      User.findOne({
        attributes: ['email'],
        where: {
          id: article.dataValues.author
        }
      }).then((user) => {
        let correctUser;
        if (req.app.locals.correctUserId === article.dataValues.author) {
          correctUser = true;
        } else {
          correctUser = false;
        }
        
        res.json({
          success: true,
          article: article.dataValues,
          author: user.dataValues.email,
          userLogged: req.isAuthenticated(),
          correctUser: correctUser
        });
      }).catch(err => console.log(err));
    }).catch(err => console.log(err));
});

// Get edit article
router.get('/edit/:id', isUserLogged, (req, res) => {
  Article.findByPk(req.params.id)
    .then((article) => {
      if (article.dataValues.author != req.user.id) {
        return res.status(403).json({
          success: false,
          flash: 'Access denied!',
          userLogged: req.isAuthenticated()
        });
      } else {
        res.json({
          success: true,
          article: article.dataValues,
          userLogged: req.isAuthenticated()
        });
      }
    }).catch(err => console.log(err));
});

// Post edit article (update)
router.post('/edit/:id', isUserLogged, [
  check('title', 'Title is required').not().isEmpty(),
  check('body', 'Article must have a body').not().isEmpty()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({
      success: false,
      message: errors.array(),
      userLogged: req.isAuthenticated()
    });
  } else {
    // Prevent from updating by other logged in user
    Article.findByPk(req.params.id)
      .then(article => {
       if (article.dataValues.author != req.user.id) {
          return res.status(403).json({
            success: false,
            message: '403 Forbidden'
          });
       } else {
          Article.update({ 
            title: req.body.title.trim(),
            body: req.body.body.trim()
          }, {
            where: {
              id: req.params.id
            }
          }).then(() => {
            return res.json({
              success: true,
              flash: 'Article updated!',
              userLogged: req.isAuthenticated()
            });
          }).catch(err => console.log(err));
       }
      })
      .catch(err => console.log(err));
  }
});

// Delete article
router.delete('/:id', isUserLogged, (req, res) => {
  // Ajax request, so need to response status, protect from anonymous deleting -> Server Internal Error
  if (!req.user.id) {
    res.status(500).send();
  } else {
    // Prevent from deleting by other person
    Article.findByPk(req.params.id)
    .then((article) => {
      if (article.dataValues.author != req.user.id) {
        return res.status(500).json({
          success: false,
          message: '500 Server Internal Error',
          userLogged: req.isAuthenticated()
        });
      } else {
        article.destroy()
          .then(() => {
            return res.json({
              success: true,
              flash: 'Article deleted!',
              userLogged: req.isAuthenticated()
            });
          }).catch(err => console.log(err));
      }
    }).catch(err => console.log(err));
  }
});

// Access control
function isUserLogged(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(401).json({
      success: false,
      flash: 'Access denied!',
      userLogged: false
    });
  }
}

module.exports = router;