const resend = require("./resend");
const emailTemplate = require("./emailTemplate");

const sendVerificationEmail = async (userName, email, verifyAccountUrl) => {
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

  await resend.emails.send({
    from: "EventPlace <onboarding@resend.dev>", // change after domain verify
    to: email,
    subject: `Verify your EventPlace account, ${userName}`,
    html,
  });
};

module.exports = sendVerificationEmail;