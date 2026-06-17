const { MailerSend, EmailParams, Sender, Recipient, Attachment } = require("mailersend");

const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY,
});

const sendMail = async ({ to, subject, html, attachments }) => {
    try {
        const sentFrom = new Sender(
            process.env.MAILERSEND_APP_EMAIL, "EventPlace"
        );

        const recipients = [
            new Recipient(to)
        ];

        const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo(recipients)
            .setSubject(subject)
            .setHtml(html);

        // 📎 Attachments (IMPORTANT CHANGE)
        if (attachments && attachments.length > 0) {
            const formattedAttachments = attachments.map(att =>
                new Attachment(
                    att.content,   // base64 string
                    att.filename,
                    att.type
                )
            );

            emailParams.setAttachments(formattedAttachments);
        }

        const response = await mailerSend.email.send(emailParams);

        console.log(`📧 Email sent to ${to}`);
        return response;

    } catch (error) {
        console.error("❌ MailerSend Error:", error.body || error.message);
        throw error;
    }
};

module.exports = sendMail;