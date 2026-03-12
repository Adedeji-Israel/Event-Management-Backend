const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: process.env.APP_EMAIL,
    pass: process.env.APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((err, success) => {
  if (success) {
    console.log("NOEMIALER KEY:", process.env.APP_EMAIL ? "Loaded" : "Missing");
    console.log("✅ Mailer is ready!");
  }
  else {
    console.error("Mailer Error:", err);
  }
});

module.exports = transporter; 