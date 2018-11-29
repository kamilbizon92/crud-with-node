module.exports = function sendMessage(receiver, token) {
  const sgMail = require('@sendgrid/mail');
  const SENDGRID_API_KEY = require('./config.json').SENDGRID_API_KEY;
  sgMail.setApiKey(SENDGRID_API_KEY);

  const msg = {
    to: receiver,
    from: 'test@email.com',
    subject: 'Password recovery',
    text: `Hi! You asked for password recovery, click this link to change your password: http://localhost:3000/users/recovery/${token}. If it was not you, ignore it.`,
    html: `<strong>Hi!</strong><br/>You asked for password recovery, click link below to change your password: <br />
    <a href="http://localhost:3000/users/recovery/${token}">http://localhost:3000/users/recovery/${token}</a><br/>If it was not you, ignore it.`
  }

  return sgMail.send(msg);
}