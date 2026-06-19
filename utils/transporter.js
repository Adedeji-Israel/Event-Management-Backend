const { createTransport } = require("nodemailer");
const dotEnv = require("dotenv");
dotEnv.config();

const transporter = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    // service: "gmail",
    auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_PASSWORD
    },

});

transporter.verify((error, success) => {
    if (error) {
        console.log("Transporter Error: ", error);
    } else {
        console.log("server is ready to receive our message");
    }
});

module.exports = transporter
