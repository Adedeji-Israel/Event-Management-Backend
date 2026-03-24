const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = async ({ to, subject, html, attachments }) => {
    try {
        const msg = {
            to,
            from: `Eventplace <${process.env.APP_EMAIL}>`,
            subject,
            html,
            attachments: attachments || [],
        };

        const response = await sgMail.send(msg);

        console.log(`📧 Email sent to ${to}`);
        return response;

    } catch (error) {
        console.error("❌ SendGrid Error:", error.response?.body || error.message);
        throw error;
    }
};

module.exports = sendMail;