const nodemailer = require("nodemailer")
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.app_email,
    pass: process.env.app_password
  },

  tls: {
    rejectUnauthorized: false
  }
})

transporter.verify((err, success) => {
  if (success) {
    console.log("Nodemailer is ready to send emails")
  } else {
    console.log(err)
  }
})

module.exports = transporter