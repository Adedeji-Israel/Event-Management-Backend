const sendMail = require("../../utils/sendGrid");
const emailTemplate = require("../../utils/emailTemplate");

const sendResetPasswordEmail = async (userName, email, resetUrl) => {

  const html = emailTemplate({
    heading: "Password Reset Request",
    message: `
      <p>Hello ${userName},</p>
      <p>You requested to reset your password.</p>
      <p>Click the button below to create a new password.</p>
    `,
    buttonText: "Reset Password",
    buttonLink: resetUrl,
    footerNote: "This link expires in 1 hour.",
  });

  return await sendMail({
    to: email,
    subject: "Reset your EventPlace password",
    html,
  });
};

module.exports = sendResetPasswordEmail;