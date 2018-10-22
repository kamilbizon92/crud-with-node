const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');

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

// Passport config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Set global user variable
app.get('*', (req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Home route
app.get('/', (req, res) => {
  pool.query('SELECT * FROM posts ORDER BY id DESC', (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.render('index', {
        articles: result.rows
      });
    }
  });
});

// Route files
const articles = require('./routes/articles');
const users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);

// Start server
app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});