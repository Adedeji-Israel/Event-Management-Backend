const transporter = require("../../utils/nodemailer");
const emailTemplate = require("../../utils/emailTemplate");

const sendTicketEmail = async (ticket, pdfBuffer, event) => {

  if (!pdfBuffer) {
    throw new Error("Ticket PDF missing");
  }

  const html = emailTemplate({
    heading: `Your Ticket for ${event.title}`,
    message: `
      <p>Hello ${ticket.name},</p>
      <p>Your ticket for <strong>${event.title}</strong> is attached.</p>
      <p>Please bring this ticket to the event.</p>
    `,
  });

  const info = await transporter.sendMail({
    from: `"EventPlace" <${process.env.APP_EMAIL}>`,
    to: ticket.email,
    subject: `Your Ticket for ${event.title}`,
    html,
    attachments: [
      {
        filename: `${ticket.ticketId}.pdf`,
        content: pdfBuffer,
      },
    ],
  });

  console.log(`🎟 Ticket email sent to ${ticket.email}`);
  return info;
};

module.exports = sendTicketEmail;