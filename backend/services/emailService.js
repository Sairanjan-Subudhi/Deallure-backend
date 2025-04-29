const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or your SMTP provider
  auth: {
    user: process.env.SMTP_EMAIL, // Email address
    pass: process.env.SMTP_PASSWORD, // App password
  },
});

// Send email function
async function sendPriceDropAlert(userEmail, productUrl, currentPrice) {
  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: userEmail,
    subject: '🔥 Price Drop Alert!',
    html: `
      <h2>Good news! 🎉</h2>
      <p>The product you were tracking has dropped in price.</p>
      <p><strong>New Price:</strong> ₹${currentPrice}</p>
      <p><a href="${productUrl}" target="_blank">View Product</a></p>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Email sent to ${userEmail} for price drop!`);
}

module.exports = {
  sendPriceDropAlert,
};
