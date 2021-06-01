const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'fustroli@gmail.com',
    subject: 'Thanks for joining Task Manager',
    text: `Welcome to the app, ${name}, let me know how you get along with the app.`,
  });
};
const sendCancelEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'fustroli@gmail.com',
    subject: 'Sorry to see you go',
    text: `Sorry to see you go, ${name}, let me know if we could have done better.`,
    html: '<h1>Task Manager</h1>',
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancelEmail,
};
