const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,

  auth: {
    user: process.env.APP_EMAIL,
    pass: process.env.APP_PASSWORD 
  },

  tls: {
    rejectUnauthorized: false
  }
});

transporter.verify((err, success) => {
  if (success) {
    console.log("Nodemailer is ready to send emails");
  } else {
    console.log("NODEMAILER ERROR: ", err);
  }
});

module.exports = transporter