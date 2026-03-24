const sendMail = require("../../utils/sendGrid");
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

    return await sendMail({
        to: email,
        subject: "New Login Detected - EventPlace",
        html,
    });
};

module.exports = sendLoginSuccessEmail;