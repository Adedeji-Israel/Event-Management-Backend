const transporter = require("../../utils/transporter");
const emailTemplate = require("../../utils/emailTemplate");

const sendVerificationSuccessEmail = async (userName, email, loginUrl) => {

  try {
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

    await transporter.sendMail({
      from: `"EventPlace" <${process.env.APP_EMAIL}>`,
      to: email,
      subject: "Your EventPlace account is verified 🎉",
      html,
    });
    
  } catch (error) {
    console.log("Verification email error: ", error);
    return { success: false, error: error.message };
  }

};

module.exports = sendVerificationSuccessEmail;