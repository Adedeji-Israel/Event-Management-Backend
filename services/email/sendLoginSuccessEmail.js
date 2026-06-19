// const sendMail = require("../../utils/mailerSend");
const transporter = require("../../utils/transporter");

const emailTemplate = require("../../utils/emailTemplate");

const sendLoginSuccessEmail = async (userName, email) => {

    const html = emailTemplate({
        heading: "Login Successful",
        message: `
      <p>Hello ${userName},</p>
      <p>You have successfully logged in to your <strong>EventPlace</strong> account.</p>
      <p>If this was not you, please reset your password immediately.</p>
    `,
    });

    transporter.sendMail({
        to: email,
        subject: "*** testing 12 ***",
        html,
    });

    console.log("Login success email sent successfully!");

    // return await sendMail({
    //     to: email,
    //     subject: "New Login Detected - EventPlace",
    //     html,
    // });
};

module.exports = sendLoginSuccessEmail;