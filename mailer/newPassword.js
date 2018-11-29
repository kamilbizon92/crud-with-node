module.exports = function sendMessage(receiver) {
  const sgMail = require('@sendgrid/mail');
  const SENDGRID_API_KEY = require('./config.json').SENDGRID_API_KEY;
  sgMail.setApiKey(SENDGRID_API_KEY);

  const msg = {
    to: receiver,
    from: 'test@email.com',
    subject: 'Password change',
    text: `You changed your password in this moment. If it was not you, please, check your account.`,
    html: `You changed your password in this moment. If it was not you, please, check your account.`
  }

  return sgMail.send(msg);
}