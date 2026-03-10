const transporter = require("./mailer");
const emailTemplate = require("../../utils/emailTemplate");

const sendVerificationSuccessEmail = async (userName, email, loginUrl) => {
  try {
    const html = emailTemplate({
      heading: "Account Verified Successfully 🎉",
      message: `
        <p>Hello ${userName},</p>
        <p>
          Congratulations! Your <strong>EventPlace</strong> account has been
          successfully verified.
        </p>
        <p>You now have full access to attend and organize events seamlessly.</p>
      `,
      buttonText: "Log in to Your Account",
      buttonLink: loginUrl,
    });

    const info = await transporter.sendMail({
      from: `"EventPlace" <${process.env.APP_EMAIL}>`,
      to: email,
      subject: `Welcome ${userName}! Your account is verified 🎉`,
      html,
    });

    console.log("✅ Verification Success Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Verification Success Email Error:", error);
    throw error;
  }
};

module.exports = sendVerificationSuccessEmail;