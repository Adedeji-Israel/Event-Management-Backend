const transporter = require("../../utils/nodemailer");
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

  const info = await transporter.sendMail({
    from: `"Eventplace" <${process.env.APP_EMAIL}>`,
    to: email,
    subject: `Verify your Eventplace account`,
    html,
  });

  console.log(`📧 Verification email sent to ${email}`);
  return info;
};

module.exports = sendVerificationEmail;