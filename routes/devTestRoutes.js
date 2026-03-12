const express = require("express");
const router = express.Router();

const transporter = require("../utils/nodemailer");
const generateTicketPDF = require("../utils/generateTicketPDF");

/* ================= SIMPLE EMAIL TEST ================= */
router.get("/send-test-email", async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({
        message: "Provide email ?email=test@gmail.com"
      });
    }

    await transporter.sendMail({
      from: `"Eventplace" <${process.env.APP_EMAIL}>`,
      to: email,
      subject: "Eventplace Email Test",
      html: `
        <div style="font-family:sans-serif;padding:20px">
          <h2>Email Test Successful 🎉</h2>
          <p>Your mail system is working correctly.</p>
          <p>Sent from Eventplace backend.</p>
        </div>
      `
    });

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
        message: "Provide email ?email=test@gmail.com"
      });
    }

    /* Mock event */
    const event = {
      title: "Eventplace Launch Party",
      date: new Date(),
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
        {
          name: "VIP Pass",
          quantity: 1,
          price: 5000
        }
      ]
    };

    const pdfBuffer = await generateTicketPDF(ticket, event);

    await transporter.sendMail({
      from: `"Eventplace" <${process.env.APP_EMAIL}>`,
      to: email,
      subject: "Your Event Ticket 🎟",
      html: `
        <div style="font-family:sans-serif;padding:20px">
          <h2>Your Ticket is Ready</h2>
          <p>This is a test ticket email.</p>
          <p>Event: <b>${event.title}</b></p>
        </div>
      `,
      attachments: [
        {
          filename: "event-ticket.pdf",
          content: pdfBuffer
        }
      ]
    });

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