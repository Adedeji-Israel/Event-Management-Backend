const transporter = require("../../utils/nodemailer");
const emailTemplate = require("../../utils/emailTemplate"); 

const sendVerificationEmail = async (userName, email, verifyAccountUrl) => {
  try {
    const html = emailTemplate({
      heading: "VERIFY YOUR ACCOUNT",
      message: `
        <p>Hello ${userName},</p>
        <p>
          Welcome to <strong>EventPlace</strong> 🎉  
          You're one step away from accessing your dashboard.
          Please confirm your email address to activate your account.
        </p>
      `,
      buttonText: "VERIFY EMAIL ADDRESS",
      buttonLink: verifyAccountUrl,
      footerNote: "This verification link expires in 1 hour.",
    });

    const info = await transporter.sendMail({
      from: `"Eventplace" <${process.env.APP_EMAIL}>`,
      to: email,
      subject: `Verify your Eventplace account, ${userName}`,
      html,
    });

    console.log("Verification Email Sent:", info.messageId);
    return info;

  } catch (error) {
    console.error("Verification Email Error:", error);
    throw error;
  }
};

module.exports = sendVerificationEmail;