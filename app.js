const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const session = require('express-session');
const flash = require('connect-flash');

// Init app
const app = express();
const PORT = process.env.PORT || 3000;

// Set postgresql database
const config = require('./config/database');
const pool = new Pool({
  user: config.user,
  host: config.host,
  database: config.database,
  password: config.password,
  port: config.port
});

// Needed for parsing req
app.use(express.urlencoded({extended: true}));

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Set session and flash message
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

app.use(flash());

app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

// Routing
app.get('/', (req, res) => {
  pool.query('SELECT * FROM posts ORDER BY id DESC', (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.render('index', {
        h1: 'Articles',
        articles: result.rows
      });
    }
  });
});

// Form for add article
app.get('/articles/add', (req, res) => {
  res.render('add_article', {
    h1: 'Add article'
  });
});

// Add new article
app.post('/articles/add', (req, res) => {
  pool.query('INSERT INTO posts (title, author, body) VALUES ($1, $2, $3)', [req.body.title, req.body.author, req.body.body], (err) => {
    if (err) {
      console.log(err);
    } else {
      req.flash('success', 'Article added!');
      res.redirect('/');
    }
  });
});

// Get single article
app.get('/article/:id', (req, res) => {
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
app.get('/article/edit/:id', (req, res) => {
  pool.query('SELECT * FROM posts WHERE id=$1', [req.params.id], (err, article) => {
    if (err) {
      console.log(err);
    } else {
      res.render('edit_article', {
        h1: 'Edit article',
        article: article.rows[0]
      });
    }
  });
});

// Post edit article (update)
app.post('/article/edit/:id', (req, res) => {
  pool.query('UPDATE posts SET title=$1, author=$2, body=$3 WHERE id=$4', [req.body.title, req.body.author, req.body.body, req. params.id], (err) => {
    if (err) {
      console.log(err);
    } else {
      req.flash('success', 'Article updated!');
      res.redirect('/');
    }
  });
});

// Delete article
app.delete('/article/:id', (req, res) => {
  pool.query('DELETE FROM posts WHERE id=$1', [req.params.id], (err) => {
    if (err) {
      console.log(err);
    } else {
      req.flash('warning', 'Article deleted!');
      res.sendStatus(200);
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});