const sendMail = require("../../utils/sendGrid");
const emailTemplate = require("../../utils/emailTemplate");

const sendVerificationSuccessEmail = async (userName, email, loginUrl) => {

  const html = emailTemplate({
    heading: "Account Verified Successfully 🎉",
    message: `
      <p>Hello ${userName},</p>
      <p>Your <strong>EventPlace</strong> account has been verified.</p>
      <p>You can now attend and organize events.</p>
    `,
    buttonText: "Log in to Your Account",
    buttonLink: loginUrl,
  });

  return await sendMail({
    to: email,
    subject: "Your EventPlace account is verified 🎉",
    html,
  });
};

module.exports = sendVerificationSuccessEmail;