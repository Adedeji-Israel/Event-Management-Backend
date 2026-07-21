// const transporter = require("../../utils/transporter");
// const emailTemplate = require("../../utils/emailTemplate");

// const sendLoginSuccessEmail = async (userName, email) => {

//     try {
//         const html = emailTemplate({
//             heading: "Login Successful",
//             message: `
//             <p>Hello ${userName},</p>
//             <p>You have successfully logged in to your <strong>EventPlace</strong> account.</p>
//             <p>If this was not you, please reset your password immediately.</p>
//             `,
//         });

//         await transporter.sendMail({
//             from: `"EventPlace" <${process.env.APP_EMAIL}>`,
//             to: email,
//             subject: "Login Successful - EventPlace",
//             html,
//         });

//         console.log("Login success email sent successfully!");

//     } catch (error) {
//         console.log("login email error: ", error);
//         return { success: false, error: error.message };
//     }

// };

// module.exports = sendLoginSuccessEmail;


const sendEmail = require("../../utils/resend");
const emailTemplate = require("../../utils/emailTemplate");

const sendLoginSuccessEmail = async (userName, email) => {
    try {
        const html = emailTemplate({
            heading: "Login Successful",
            message: `
        <p>Hello ${userName},</p>

        <p>
          You have successfully logged in to your
          <strong>EventPlace</strong> account.
        </p>

        <p>
          If this wasn't you, please reset your password immediately.
        </p>
      `,

            footerNote:
                "This notification was sent because someone logged into your account.",
        });

        const response = await sendEmail({
            to: email,
            subject: "Login Successful - EventPlace",
            html,
        });

        return response;
    } catch (error) {
        console.error("Login success email error:", error);

        return {
            success: false,
            error: error.message,
        };
    }
};

module.exports = sendLoginSuccessEmail;
