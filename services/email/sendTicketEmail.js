const sendMail = require("../../utils/sendGrid");
const emailTemplate = require("../../utils/emailTemplate");

const sendTicketEmail = async (ticket, pdfBuffer, event) => {

  if (!pdfBuffer) throw new Error("Ticket PDF missing");

  const html = emailTemplate({
    heading: `Your Ticket for ${event.title}`,
    message: `
      <p>Hello ${ticket.name},</p>
      <p>Your ticket for <strong>${event.title}</strong> is attached.</p>
      <p>Please bring this ticket to the event.</p>
    `,
  });

  return await sendMail({
    to: ticket.email,
    subject: `Your Ticket for ${event.title}`,
    html,
    attachments: [
      {
        content: pdfBuffer.toString("base64"),
        filename: `${ticket.ticketId}.pdf`,
        type: "application/pdf",
        disposition: "attachment",
      },
    ],
  });
};

module.exports = sendTicketEmail;