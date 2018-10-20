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

// Start server
app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});