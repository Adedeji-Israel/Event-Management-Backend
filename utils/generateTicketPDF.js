const PDFDocument = require("pdfkit");
const axios = require("axios");

const fetchImageAsBuffer = async (url) => {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });
  return Buffer.from(response.data);
};

const generateTicketPDF = async (ticket, event) => {

  const doc = new PDFDocument({
    size: "A4",
    margin: 0
  });

  const buffers = [];

  doc.on("data", buffers.push.bind(buffers));

  const pdfPromise = new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(buffers)));
  });

  try {

    /* ================= FETCH IMAGES ================= */

    const logoBuffer = await fetchImageAsBuffer(process.env.APP_LOGO);

    const bgBuffer = process.env.EMAIL_BG
      ? await fetchImageAsBuffer(process.env.EMAIL_BG)
      : null;

    const eventImageBuffer = event.image
      ? await fetchImageAsBuffer(event.image)
      : null;

    /* ================= BACKGROUND ================= */

    if (bgBuffer) {
      doc.image(bgBuffer, 0, 0, {
        width: doc.page.width,
        height: doc.page.height
      });
    }

    /* ================= HEADER ================= */

    doc.image(logoBuffer, doc.page.width / 2 - 50, 40, {
      width: 100
    });

    doc.moveDown(5);

    /* ================= EVENT IMAGE ================= */

    if (eventImageBuffer) {

      doc.image(eventImageBuffer, 70, 130, {
        width: 455,
        height: 220
      });

    }

    doc.moveDown(16);

    /* ================= EVENT TITLE ================= */

    doc
      .fontSize(28)
      .fillColor("#111")
      .font("Helvetica-Bold")
      .text(event.title, {
        align: "center"
      });

    doc.moveDown(0.5);

    doc
      .fontSize(14)
      .font("Helvetica")
      .fillColor("#444")
      .text(
        `${new Date(event.date).toDateString()} • ${event.time}`,
        { align: "center" }
      );

    doc.text(event.location, { align: "center" });

    doc.moveDown(1.5);

    /* ================= DIVIDER ================= */

    doc
      .moveTo(80, doc.y)
      .lineTo(515, doc.y)
      .strokeColor("#cccccc")
      .lineWidth(1)
      .stroke();

    doc.moveDown(1.5);

    /* ================= ATTENDEE ================= */

    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .fillColor("#000")
      .text("Attendee", 80);

    doc.moveDown(0.5);

    doc
      .fontSize(13)
      .font("Helvetica")
      .text(`Name: ${ticket.name}`, 80)
      .text(`Email: ${ticket.email}`, 80);

    doc.moveDown(1.5);

    /* ================= TICKETS ================= */

    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Tickets", 80);

    doc.moveDown(0.5);

    ticket.tickets.forEach((t) => {

      doc
        .fontSize(13)
        .font("Helvetica")
        .text(
          `${t.name}  x${t.quantity}`,
          80
        );

      doc.text(
        `₦${(t.price * t.quantity).toLocaleString()}`,
        450,
        doc.y - 15,
        { align: "right" }
      );

    });

    doc.moveDown(1);

    doc
      .fontSize(15)
      .font("Helvetica-Bold")
      .text(
        `Total Paid: ₦${ticket.amount.toLocaleString()}`,
        80,
        undefined,
        { align: "right" }
      );

    doc.moveDown(2);

    /* ================= FOOTER ================= */

    doc
      .moveTo(80, doc.y)
      .lineTo(515, doc.y)
      .strokeColor("#cccccc")
      .stroke();

    doc.moveDown(1);

    doc
      .fontSize(11)
      .fillColor("#333")
      .text(`Ticket ID: ${ticket.ticketId}`, {
        align: "center"
      });

    doc
      .fontSize(10)
      .fillColor("#666")
      .text(
        `Purchased: ${new Date(ticket.purchaseDate).toDateString()}`,
        { align: "center" }
      );

    doc.moveDown(0.5);

    doc
      .fontSize(10)
      .fillColor("#666")
      .text(
        `Powered by Eventplace`,
        { align: "center" }
      );

    doc.end();

    return pdfPromise;

  } catch (error) {

    throw error;

  }

};

module.exports = generateTicketPDF;