const transporter = require("../../utils/transporter");
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
      </p>
      <p>Please confirm your email address to activate your account.</p>
    `,
      buttonText: "VERIFY EMAIL ADDRESS",
      buttonLink: verifyAccountUrl,
      footerNote: "This verification link expires in 1 hour.",
    });

    await transporter.sendMail({
      from: `"EventPlace" <${process.env.APP_EMAIL}>`,
      to: email,
      subject: `Verify your account - EventPlace`,
      html,
    });
    
  } catch (error) {
    console.log("Verification email error: ", error);
    return { success: false, error: error.message };
  }

};

module.exports = sendVerificationEmail;