const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');

// Init app
const app = express();
const PORT = process.env.PORT || 5000;

// Needed for parsing req
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Set session and flash message
app.use(session({
  cookie: {
    maxAge: 1000*60*15
  },
  name: 'sid',
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  rolling: true
}));

// Passport config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Use cors for fetch request from client
app.use(cors());

// Set global user variable
app.get('*', (req, res, next) => {
  res.locals.user = req.user || null;
  if (req.user) {
    app.locals.correctUserId = req.user.id
  } else {
    app.locals.correctUserId = false;
  }
  next();
});

// Route files
app.use('/articles', require('./routes/articles'));
app.use('/users', require('./routes/users'));

// Start server
app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});