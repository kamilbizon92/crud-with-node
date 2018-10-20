const express = require('express');
const path = require('path');

// Init app
const app = express();
const PORT = process.env.PORT || 3000;

// Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Routing
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Hello'
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