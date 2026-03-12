const transporter = require("../../utils/nodemailer");
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

  const info = await transporter.sendMail({
    from: `"EventPlace" <${process.env.APP_EMAIL}>`,
    to: email,
    subject: "Reset your EventPlace password",
    html,
  });

  console.log(`🔑 Password reset email sent to ${email}`);
  return info;
};

module.exports = sendResetPasswordEmail;