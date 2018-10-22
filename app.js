const express = require('express');
const path = require('path');
const { Pool } = require('pg');

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

// Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Routing
app.get('/', (req, res) => {
  pool.query('SELECT * FROM posts ORDER BY id DESC', (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.render('index', {
        h1: 'Posts',
        posts: result.rows
      });
    }
  });
});

app.get('/articles/add', (req, res) => {
  res.render('add_article', {
    title: 'Add article'
  });
});

// Add new post
app.post('/articles/add', (req, res) => {
  pool.query('INSERT INTO posts (title, author, body) VALUES ($1, $2, $3)', [req.body.title, req.body.author, req.body.body], (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('post added');
      res.redirect('/');
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});