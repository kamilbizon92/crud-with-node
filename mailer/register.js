module.exports = function sendMessage(receiver, username, token) {
  const sgMail = require('@sendgrid/mail');
  const SENDGRID_API_KEY = require('./config.json').SENDGRID_API_KEY;
  sgMail.setApiKey(SENDGRID_API_KEY);
  
  const msg = {
    to: receiver,
    from: 'test@email.com',
    subject: 'Welcome to crud-with-node app!',
    text: `Hi ${username}! Welcome to crud-with-node application. Click link below to activate your account and confirm email address! Click to activate: http://localhost:3000/users/register/${token}`,
    html: `<strong>Hi ${username}!<strong> <br/> Welcome to crud-with-node application. Click link below to activate your account and confirm email address! <br /> <a href="http://localhost:3000/users/register/${token}">Click here to activate</a>`
  }

  return sgMail.send(msg);
}