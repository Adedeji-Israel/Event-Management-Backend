const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const { createTransport } = require("nodemailer");
const dotEnv = require("dotenv");
dotEnv.config();

const transporter = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_PASSWORD
    },
    connectionTimeout: 10000,
});

transporter.verify((error, success) => {
    if (error) {
        console.log("Transporter Error: ", error);
    } else {
        console.log("server is ready to receive our message");
    }
});

module.exports = transporter
