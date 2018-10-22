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
router.get('/add', (req, res) => {
  res.render('add_article');
});

// Add new article
router.post('/add', [
  check('title', 'Title is required').not().isEmpty(),
  check('author', 'Author is required!').not().isEmpty(),
  check('body', 'Article must have a body').not().isEmpty()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('add_article', {
      errors: errors.array()
    });
  } else {
    pool.query('INSERT INTO posts (title, author, body) VALUES ($1, $2, $3)', [req.body.title, req.body.author, req.body.body], (err) => {
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
      res.render('article', {
        article: article.rows[0]
      });
    }
  });
});

// Get edit article
router.get('/edit/:id', (req, res) => {
  pool.query('SELECT * FROM posts WHERE id=$1', [req.params.id], (err, article) => {
    if (err) {
      console.log(err);
    } else {
      res.render('edit_article', {
        article: article.rows[0]
      });
    }
  });
});

// Post edit article (update)
router.post('/edit/:id', [
  check('title', 'Title is required').not().isEmpty(),
  check('author', 'Author is required!').not().isEmpty(),
  check('body', 'Article must have a body').not().isEmpty()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    pool.query('SELECT * FROM posts WHERE id=$1', [req.params.id], (err, article) =>{
      if (err) {
        console.log(err);
      } else {
        res.render('edit_article', {
          errors: errors.array(),
          article: article.rows[0]
        });
      }
    });
  } else {
    pool.query('UPDATE posts SET title=$1, author=$2, body=$3 WHERE id=$4', [req.body.title, req.body.author, req.body.body, req. params.id], (err) => {
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
  pool.query('DELETE FROM posts WHERE id=$1', [req.params.id], (err) => {
    if (err) {
      console.log(err);
    } else {
      req.flash('warning', 'Article deleted!');
      res.sendStatus(200);
    }
  });
});

module.exports = router;