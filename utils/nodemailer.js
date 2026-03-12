const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({

  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use STARTTLS

  auth: {
    user: process.env.APP_EMAIL,
    pass: process.env.APP_PASSWORD,
  },

  tls: {
    minVersion: "TLSv1.2"
  }

});

transporter.verify((error) => {

  if (error) {
    console.error("❌ Mailer connection failed:", error);
  } 
  else {
    console.log("✅ Mailer ready (SMTP connected)");
  }

});

module.exports = transporter;