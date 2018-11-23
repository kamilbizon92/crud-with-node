module.exports = function sendMessage(receiver) {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: receiver,
    from: 'test@email.com',
    subject: 'Password change',
    text: `You changed your password in this moment. If it was not you, please, check your account.`,
    html: `You changed your password in this moment. If it was not you, please, check your account.`
  }

  return sgMail.send(msg);
}