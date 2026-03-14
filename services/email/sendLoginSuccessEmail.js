const transporter = require("../../utils/nodemailer");
const emailTemplate = require("../../utils/emailTemplate");

const sendLoginSuccessEmail = async (userName, email) => {

    const html = emailTemplate({
        heading: "Login Successful",
        message: `
      <p>Hello ${userName},</p>
      <p>You have successfully logged in to your <strong>EventPlace</strong> account.</p>
      <p>If this was not you, please reset your password immediately.</p>
    `,
        buttonText: null,
        buttonLink: null,
    });

    const info = await transporter.sendMail({
        from: `"EventPlace" <${process.env.APP_EMAIL}>`,
        to: email,
        subject: "New Login Detected - EventPlace",
        html,
    });

    console.log(`📧 Login notification sent to ${email}`);
    return info;
};

module.exports = sendLoginSuccessEmail;