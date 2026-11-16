const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Mail options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully');
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
  }
};

module.exports = sendEmail;