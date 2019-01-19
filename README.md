Main goal of this application was to write simple CRUD with registration, but with time I have added some of functionalities. List of technologies used in this project:

## Server side:
- node.js
- express framework
#### What I did?
- [x] full crud functionality
- [x] validation POST/DELETE request (with express-validator)
- [x] flash messages
- [x] user registration with password hashing using bcryptjs
- [x] user authentication with passportjs
- [x] access control
- [x] sending email after successfully registration
- [x] create account activation with unique token
- [x] password recovery with unique token (which expires after time)
- [x] simple user settings (username and password change)

## Database:
- postgreSQL database
- sequelize ORM
#### What I did?
- [x] first raw SQL queries (node-postgres)
- [x] rewrite to queries with sequelize ORM
- [x] association between models
- [x] several migrations

## Client side:
- ajax (old xhr delete)
- pug for rendering views (first version of views)
- bootstrap for simple styling (first version of views)
- rednering with react.js (current views)
- styling with materialize CSS (current views)
#### What I did?
- [x] pug template engine (which will be replaced by React.js)
- [x] simple style with materialize css (previous I used bootstrap)
- [x] used pure javascript request to delete article (ajax)
- [x] added React.js for rendering views (replaced pug enginge)

Important! This project focuses on back-end, not on front-end.

Live application can be found on heroku: https://crud-with-node-live.herokuapp.com (contain pug template engine)