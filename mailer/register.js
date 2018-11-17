module.exports = function sendMessage(receiver, username) {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = {
    to: receiver,
    from: 'test@email.com',
    subject: 'Welcome to crud-with-node app!',
    text: `Hi ${username}! Welcome to crud-with-node application. Click link below to activate your account and confirm email address!`,
    html: `<strong>Hi ${username}!<strong> <br/> Welcome to crud-with-node application. Click link below to activate your account and confirm email address!`
  }

  return sgMail.send(msg);
}