// const transporter = require("../../utils/transporter");
// const emailTemplate = require("../../utils/emailTemplate");

// const sendTicketEmail = async (ticket, pdfBuffer, event) => {

//   try {
//     if (!pdfBuffer) throw new Error("Ticket PDF missing");

//     const html = emailTemplate({
//       heading: `Your Ticket for ${event.title}`,
//       message: `
//       <p>Hello ${ticket.name},</p>
//       <p>Your ticket for <strong>${event.title}</strong> is attached.</p>
//       <p>Please bring this ticket to the event.</p>
//     `,
//     });

//     await transporter.sendMail({

//       to: ticket.email,
//       subject: `Your Ticket for ${event.title}`,
//       html,
//       attachments: [
//         {
//           content: pdfBuffer.toString("base64"),
//           filename: `${ticket.ticketId}.pdf`,
//           type: "application/pdf",
//           disposition: "attachment",
//         },
//       ],
//     });

//   } catch (error) {
//     console.log("Ticket email error: ", error);
//     throw new Error("Failed to send ticket email");
//   }

// };

// module.exports = sendTicketEmail;

const transporter = require("../../utils/transporter");
const emailTemplate = require("../../utils/emailTemplate");

const sendTicketEmail = async (ticket, pdfBuffer, event) => {

  try {
    if (!pdfBuffer) throw new Error("Ticket PDF missing");

    const html = emailTemplate({
      heading: `Your Ticket for ${event.title}`,
      message: `
      <p>Hello ${ticket.name},</p>
      <p>Your ticket for <strong>${event.title}</strong> is attached.</p>
      <p>Please bring this ticket to the event.</p>
    `,
    });

    await transporter.sendMail({
      from: `"EventPlace" <${process.env.APP_EMAIL}>`,
      to: ticket.email,
      subject: `Your Ticket for ${event.title}`,
      html,
      attachments: [
        {
          filename: `${ticket.ticketId}.pdf`,
          content: pdfBuffer,           // pass Buffer directly, no base64 conversion needed
          contentType: "application/pdf",
        },
      ],
    });

  } catch (error) {
    console.error("Ticket email error:", error);
    throw error; // preserve original error instead of masking it
  }

};

module.exports = sendTicketEmail;