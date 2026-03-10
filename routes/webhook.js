// routes/webhook.js
const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const TicketCollection = require("../models/ticket");
const EventCollection = require("../models/event");
const generateTicketPDF = require("../utils/generateTicketPDF");
const sendTicketEmail = require("../services/email/sendTicketEmail");


router.post("/paystack", async (req, res) => {
  try {
    console.log("WEBHOOK HIT");
    console.log("Headers:", req.headers);

    // Verify signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET)
      .update(req.body.toString())
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      console.log("Invalid signature");
      return res.status(401).send("Invalid signature");
    }

    const payload = JSON.parse(req.body.toString());
    console.log("EVENT:", payload.event);

    if (payload.event !== "charge.success") {
      return res.sendStatus(200);
    }

    console.log("CHARGE SUCCESS RECEIVED");

    const reference = payload.data.reference;

    const ticket = await TicketCollection.findOne({
      paymentReference: reference,
    });

    if (!ticket) return res.sendStatus(200);

    // Mark ticket as paid if not already
    if (ticket.status !== "paid") {
      ticket.status = "paid";
      await ticket.save();
    }

    // Update ticket sales count in event
    const eventDoc = await EventCollection.findById(ticket.event);
    if (eventDoc) {
      for (const item of ticket.tickets) {
        const ticketType = eventDoc.ticketTypes.id(item.ticketTypeId);
        if (ticketType) ticketType.sold += item.quantity;
      }
      await eventDoc.save();
    }

    // Generate PDF
    const pdfBuffer = await generateTicketPDF(ticket.toObject(), eventDoc);

    // Send ticket email using Nodemailer
    try {
      const info = await sendTicketEmail(ticket, pdfBuffer, eventDoc);
      console.log("TICKET EMAIL SENT SUCCESSFULLY!!! MessageId:", info.messageId);
    } catch (error) {
      console.error("Email ticket error:", error);
    }

    console.log("Webhook completed successfully");
    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook Error:", error);
    res.sendStatus(500);
  }
});

module.exports = router;