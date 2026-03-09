const resend = require("../services/email/resend");

const sendTicketEmail = async (ticket, pdfBuffer, event) => {
  try {
    await resend.emails.send({
      from: "EventPlace <onboarding@resend.dev>",
      to: ticket.email,
      subject: `Your Ticket for ${event.title}`,
      html: "<p>Your ticket PDF file is attached.</p>",
      attachments: [
        {
          filename: `${ticket.ticketId}.pdf`,
          content: pdfBuffer.toString("base64"),
          encoding: "base64",
        },
      ]
    });

    console.log("Ticket email sent successfully");
  } catch (error) {
    console.error("Email Error:", error);
    throw error;
  }
};

module.exports = sendTicketEmail;