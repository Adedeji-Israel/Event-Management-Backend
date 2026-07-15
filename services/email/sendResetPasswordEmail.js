const transporter = require("../../utils/transporter");
const emailTemplate = require("../../utils/emailTemplate");

const sendResetPasswordEmail = async (userName, email, resetUrl) => {
  try {
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

    await transporter.sendMail({
      from: `"EventPlace" <${process.env.APP_EMAIL}>`,
      to: email,
      subject: "Reset your password - EventPlace",
      html,
    });

    return { success: true };
  } catch (error) {
    console.log("Reset password email error: ", error);
    return { success: false, error: error.message };
  }
};

module.exports = sendResetPasswordEmail;
