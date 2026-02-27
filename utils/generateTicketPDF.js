const PDFDocument = require("pdfkit");
const axios = require("axios");

const fetchImageAsBuffer = async (url) => {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });
  return Buffer.from(response.data);
};

const generateTicketPDF = async (ticket, event) => {
  try {
    const doc = new PDFDocument({ size: "A4", margin: 20 });

    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));

    const pdfPromise = new Promise((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(buffers)));
    });

    // ===== Fetch Images from URLs =====
    const logoBuffer = await fetchImageAsBuffer(process.env.APP_LOGO);
    const bgBuffer = process.env.EMAIL_BG
      ? await fetchImageAsBuffer(process.env.EMAIL_BG)
      : null;
    const eventImageBuffer = event.image
      ? await fetchImageAsBuffer(event.image)
      : null;

    // ================= BACKGROUND =================
    if (bgBuffer) {
      doc.image(bgBuffer, 0, 0, {
        width: doc.page.width,
        height: doc.page.height,
      });
    }

    // Light white overlay for readability
    doc.rect(0, 0, doc.page.width, doc.page.height)
      .fillOpacity(0.9)
      .fill("#ffffff");

    doc.fillOpacity(1);

    doc.moveDown(2);

    // ================= LOGO =================
    doc.image(logoBuffer, doc.page.width / 2 - 60, 40, {
      width: 120,
    });

    doc.moveDown(4);

    // ================= EVENT IMAGE =================
    if (eventImageBuffer) {
      doc.image(eventImageBuffer, 50, 150, {
        width: 500,
        height: 220,
      });
      doc.moveDown(12);
    }

    // ================= EVENT TITLE =================
    doc
      .fontSize(26)
      .fillColor("#111")
      .text(event.title, {
        align: "center",
      });

    doc.moveDown(0.5);

    doc
      .fontSize(14)
      .fillColor("#444")
      .text(
        `${new Date(event.date).toDateString()} | ${event.time}`,
        { align: "center" }
      )
      .text(event.location, { align: "center" });

    doc.moveDown(1.5);

    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor("#dddddd")
      .stroke();

    doc.moveDown(1);

    // ================= ATTENDEE =================
    doc.fontSize(16).fillColor("#000").text("Attendee Details");
    doc.moveDown(0.5);

    doc.fontSize(13);
    doc.text(`Name: ${ticket.name}`);
    doc.text(`Email: ${ticket.email}`);
    doc.text(`Ticket ID: ${ticket.ticketId}`);

    doc.moveDown(1.5);

    // ================= TICKETS =================
    doc.fontSize(16).text("Tickets Purchased");
    doc.moveDown(0.5);

    ticket.tickets.forEach((t) => {
      doc.fontSize(13).text(
        `${t.name} x ${t.quantity} — ₦${(
          t.price * t.quantity
        ).toLocaleString()}`
      );
    });

    doc.moveDown(1);

    doc
      .fontSize(16)
      .fillColor("#000")
      .text(`Total Paid: ₦${ticket.amount.toLocaleString()}`, {
        align: "right",
      });

    doc.moveDown(2);

    doc
      .fontSize(10)
      .fillColor("#666")
      .text(
        `Purchase Date: ${new Date(ticket.purchaseDate).toDateString()}`,
        { align: "center" }
      )
      .text(
        `© 2026, Powered by Eventplace. All rights reserved`,
        { align: "center" }
      );

    doc.end();

    return pdfPromise;
  } catch (error) {
    throw error;
  }
};

module.exports = generateTicketPDF;