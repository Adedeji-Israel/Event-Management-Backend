const transporter = require("./mailer");
const emailTemplate = require("../../utils/emailTemplate");

const sendResetPasswordEmail = async (userName, email, resetUrl) => {
  try {
    const html = emailTemplate({
      heading: "Password Reset Request",
      message: `
        <p>Hello ${userName},</p>
        <p>You recently requested to reset your password for your EventPlace account.</p>
        <p>Click the button below to reset your password.</p>
      `,
      buttonText: "Reset Password",
      buttonLink: resetUrl,
      footerNote: "This link will expire in 1 hour.",
    });

    const info = await transporter.sendMail({
      from: `"EventPlace" <${process.env.APP_EMIL}>`,
      to: email,
      subject: "Password Reset Request",
      html,
    });

    console.log("✅ Reset Password Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Reset Password Email Error:", error);
    throw error;
  }
};

module.exports = sendResetPasswordEmail;