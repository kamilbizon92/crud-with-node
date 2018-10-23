const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { check, validationResult } = require('express-validator/check');

// Set postgresql database
const config = require('../config/database');
const pool = new Pool({
  user: config.user,
  host: config.host,
  database: config.database,
  password: config.password,
  port: config.port
});

// Form for add article
router.get('/add', isUserLogged, (req, res) => {
  res.render('add_article');
});

// Add new article
router.post('/add', [
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
    pool.query('INSERT INTO posts (title, author, body) VALUES ($1, $2, $3)', [req.body.title, req.user.id, req.body.body], (err) => {
      if (err) {
        console.log(err);
      } else {
        req.flash('success', 'Article added!');
        res.redirect('/');
      }
    });
  }
});

// Get single article
router.get('/:id', (req, res) => {
  pool.query('SELECT * FROM posts WHERE id=$1', [req.params.id], (err, article) => {
    if (err) {
      console.log(err);
    } else {
      pool.query('SELECT email FROM users WHERE id=$1', [article.rows[0].author], (err, author) => {
        if (err) {
          console.log(err);
        } else {
          res.render('article', {
            article: article.rows[0],
            author: author.rows[0].email
          });
        }
      });
    }
  });
});

// Get edit article
router.get('/edit/:id', isUserLogged, (req, res) => {
  pool.query('SELECT * FROM posts WHERE id=$1', [req.params.id], (err, article) => {
    if (article.rows[0].author != req.user.id) {
      req.flash('warning', 'Access denied');
      return res.redirect('/');
    } else {
      if (err) {
        console.log(err);
      } else {
        res.render('edit_article', {
          article: article.rows[0]
        });
      }
    }
  });
});

// Post edit article (update)
router.post('/edit/:id', [
  check('title', 'Title is required').not().isEmpty(),
  check('body', 'Article must have a body').not().isEmpty()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    pool.query('SELECT * FROM posts WHERE id=$1', [req.params.id], (err, article) => {
      if (err) {
        console.log(err);
      } else {
        res.render('edit_article', {
          errors: errors.array(),
          article: article.rows[0],
          user: req.user
        });
      }
    });
  } else {
    pool.query('UPDATE posts SET title=$1, body=$2 WHERE id=$3', [req.body.title, req.body.body, req. params.id], (err) => {
      if (err) {
        console.log(err);
      } else {
        req.flash('success', 'Article updated!');
        res.redirect('/');
      }
    });
  }
});

// Delete article
router.delete('/:id', (req, res) => {
  // Ajax request, so need to response status, protect from anonymous deleting -> Server Internal Error
  if (!req.user.id) {
    res.status(500).send();
  }
  // Prevent from deleting by other person
  pool.query('SELECT * FROM posts WHERE id=$1', [req.params.id], (err, article) => {
    if (err) {
      console.log(err);
    } else {
      if (article.rows[0].author != req.user.id) {
        res.status(500).send();
      } else {
        pool.query('DELETE FROM posts WHERE id=$1', [req.params.id], (err) => {
          if (err) {
            console.log(err);
          } else {
            req.flash('warning', 'Article deleted!');
            res.sendStatus(200);
          }
        });
      }
    }
  });
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