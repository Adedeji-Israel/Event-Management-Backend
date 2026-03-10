const transporter = require("../../utils/nodemailer");
const emailTemplate = require("../../utils/emailTemplate"); 

const sendTicketEmail = async (ticket, pdfBuffer, event) => {
  try {
    const html = emailTemplate({
      heading: `Your Ticket for ${event.title}`,
      message: `
        <p>Hello ${ticket.name},</p>
        <p>Your ticket(s) for <strong>${event.title}</strong> is attached below.</p>
      `,
      buttonText: null,
      buttonLink: null,
    });

    const info = await transporter.sendMail({
      from: `"EventPlace" <${process.env.APP_EMAIL}>`,
      to: ticket.email,
      subject: `Your Ticket for ${event.title}`,
      html,
      attachments: [
        {
          filename: `${ticket.ticketId}.pdf`,
          content: pdfBuffer, // direct Buffer
        },
      ],
    });

    console.log("✅ Ticket Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Ticket Email Error:", error);
    throw error;
  }
};

module.exports = sendTicketEmail;