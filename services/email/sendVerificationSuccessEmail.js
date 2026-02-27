const resend = require("./resend");
const emailTemplate = require("./emailTemplate");

const sendVerificationSuccessEmail = async (userName, email, loginUrl) => {
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

  await resend.emails.send({
    from: "EventPlace <onboarding@resend.dev>",
    to: email,
    subject: `Welcome ${userName}! Your account is verified 🎉`,
    html,
  });
};

module.exports = sendVerificationSuccessEmail;