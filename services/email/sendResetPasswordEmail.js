const resend = require("./resend");
const emailTemplate = require("./emailTemplate");

const sendResetPasswordEmail = async (email, userName, resetUrl) => {
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

  await resend.emails.send({
    from: "EventPlace <onboarding@resend.dev>",
    to: email,
    subject: "Password Reset Request",
    html,
  });
};

module.exports = sendResetPasswordEmail;