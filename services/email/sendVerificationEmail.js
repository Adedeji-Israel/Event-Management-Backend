const sendMail = require("../../utils/sendGrid");
const emailTemplate = require("../../utils/emailTemplate");

const sendVerificationEmail = async (userName, email, verifyAccountUrl) => {

  const html = emailTemplate({
    heading: "VERIFY YOUR ACCOUNT",
    message: `
      <p>Hello ${userName},</p>
      <p>
        Welcome to <strong>EventPlace</strong> 🎉
        You're one step away from accessing your dashboard.
      </p>
      <p>Please confirm your email address to activate your account.</p>
    `,
    buttonText: "VERIFY EMAIL ADDRESS",
    buttonLink: verifyAccountUrl,
    footerNote: "This verification link expires in 1 hour.",
  });

  return await sendMail({
    to: email,
    subject: `Verify your Eventplace account`,
    html,
  });
};

module.exports = sendVerificationEmail;