const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

// Import database models
const User = require('../database/models').User;
const Article = require('../database/models').Article;

// Form for add article
router.get('/add', isUserLogged, (req, res) => {
  res.render('add_article');
});

// Add new article
router.post('/add', isUserLogged, [
  check('title', 'Title is required').not().isEmpty(),
  check('body', 'Article must have a body').not().isEmpty()
], (req, res) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('add_article', {
      errors: errors.array(),
      user: req.user
    });
  } else {
    Article.create({
      title: req.body.title.trim(),
      author: req.user.id,
      body: req.body.body.trim()
    }).then(() => {
      req.flash('success', 'Article added!');
      res.redirect('/');
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
        res.render('article', {
          article: article.dataValues,
          author: user.dataValues.email
        });
      }).catch(err => console.log(err));
    }).catch(err => console.log(err));
});

// Get edit article
router.get('/edit/:id', isUserLogged, (req, res) => {
  Article.findByPk(req.params.id)
    .then((article) => {
      if (article.dataValues.author != req.user.id) {
        req.flash('warning', 'Access denied');
        res.redirect('/');
      } else {
        res.render('edit_article', {
          article: article.dataValues
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
    Article.findByPk(req.params.id)
      .then((article) => {
        res.render('edit_article', {
          errors: errors.array(),
          article: article.dataValues,
          user: req.user
        });
      }).catch(err => console.log(err));
  } else {
    // Prevent from updating by other logged in user
    Article.findByPk(req.params.id)
      .then(article => {
        if (article.dataValues.author != req.user.id) {
          req.flash('warning', 'Access denied!');
          res.redirect('/');
        } else {
          Article.update({ 
            title: req.body.title.trim(),
            body: req.body.body.trim()
          }, {
            where: {
              id: req.params.id
            }
          }).then(() => {
            req.flash('success', 'Article updated!');
            res.redirect('/');
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
  }
  // Prevent from deleting by other person
  Article.findByPk(req.params.id)
    .then((article) => {
      if (article.dataValues.author != req.user.id) {
        res.status(500).send();
      } else {
        article.destroy()
          .then(() => {
            req.flash('warning', 'Article deleted!');
            res.sendStatus(200);
          }).catch(err => console.log(err));
      }
    }).catch(err => console.log(err));
});

// Access control
function isUserLogged(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('warning', 'Access denied');
    res.redirect('/users/login');
  }
}

module.exports = router;