const express = require("express");
const router = express.Router();

const sendMail = require("../utils/sendGrid");
const generateTicketPDF = require("../utils/generateTicketPDF");

/* ================= SIMPLE EMAIL TEST ================= */
router.get("/send-test-email", async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({
        message: "Provide email as query param: ?email=test@example.com"
      });
    }

    const htmlContent = `
      <div style="font-family:sans-serif;padding:20px">
        <h2>Email Test Successful 🎉</h2>
        <p>Your mail system is working correctly.</p>
        <p>Sent from Eventplace backend.</p>
      </div>
    `;

    await sendMail({
      from: `"Eventplace" <${process.env.APP_EMAIL}>`, // must be verified domain
      to: email,
      subject: "Eventplace Email Test",
      html: htmlContent,
      text: htmlContent.replace(/<[^>]+>/g, "") // plain text fallback
    });

    console.log(`📧 Test email sent to ${email}`);
    res.json({
      success: true,
      message: `Email sent to ${email}`
    });

  } catch (error) {
    console.error("Email test failed:", error);
    res.status(500).json({
      message: "Email failed",
      error: error.message
    });
  }
});


/* ================= TICKET EMAIL TEST ================= */
router.get("/send-ticket-test", async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({
        message: "Provide email as query param: ?email=test@example.com"
      });
    }

    /* Mock event */
    const event = {
      title: "Eventplace Launch Party",
      date: new Date().toLocaleDateString(),
      time: "6:00 PM",
      location: "Ibadan Conference Center",
      image: process.env.TEST_EVENT_IMAGE || null
    };

    /* Mock ticket */
    const ticket = {
      name: "Test User",
      email,
      ticketId: "TEST-" + Date.now(),
      purchaseDate: new Date(),
      amount: 5000,
      tickets: [
        { name: "VIP Pass", quantity: 1, price: 5000 }
      ]
    };

    const pdfBuffer = await generateTicketPDF(ticket, event);

    const htmlContent = `
      <div style="font-family:sans-serif;padding:20px">
        <h2>Your Ticket is Ready 🎟</h2>
        <p>This is a test ticket email.</p>
        <p><strong>Event:</strong> ${event.title}</p>
        <p><strong>Date:</strong> ${event.date} | <strong>Time:</strong> ${event.time}</p>
        <p><strong>Venue:</strong> ${event.location}</p>
      </div>
    `;

    await sendMail({
      from: `"Eventplace" <${process.env.APP_EMAIL}>`,
      to: email,
      subject: `Your Ticket for ${event.title}`,
      html: htmlContent,
      text: htmlContent.replace(/<[^>]+>/g, ""), // plain text fallback
      attachments: [
        {
          content: pdfBuffer.toString("base64"), // SendGrid requires base64
          filename: "event-ticket.pdf",
          type: "application/pdf",
          disposition: "attachment"
        }
      ]
    });

    console.log(`🎫 Ticket email sent to ${email}`);
    res.json({
      success: true,
      message: `Ticket email sent to ${email}`
    });

  } catch (error) {
    console.error("Ticket email test failed:", error);
    res.status(500).json({
      message: "Ticket email failed",
      error: error.message
    });
  }
});

module.exports = router;