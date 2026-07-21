const { Resend } = require("resend");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
    try {
        const { data, error } = await resend.emails.send({
            from: "EventPlace <onboarding@resend.dev>",
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
        });

        if (error) {
            console.error("Resend Error:", error);
            throw new Error(error.message);
        }

        console.log("Email sent successfully:", data);

        return {
            success: true,
            data,
        };
    } catch (err) {
        console.error("Resend Error:", err);

        return {
            success: false,
            error: err.message,
        };
    }
};

module.exports = sendEmail;
