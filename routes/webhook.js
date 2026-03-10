const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const TicketCollection = require("../models/ticket");
const EventCollection = require("../models/event");
const generateTicketPDF = require("../utils/generateTicketPDF");
const sendTicketEmail = require("../services/email/sendTicketEmail");

router.post("/paystack", express.raw({ type: "*/*" }), async (req, res) => {
  try {
    console.log("WEBHOOK HIT");

    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET)
      .update(req.body)
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      console.log("Invalid signature");
      return res.status(401).send("Invalid signature");
    }

    const payload = JSON.parse(req.body);
    if (payload.event !== "charge.success") return res.sendStatus(200);

    const reference = payload.data.reference;
    const ticket = await TicketCollection.findOne({ paymentReference: reference });
    if (!ticket) return res.sendStatus(200);

    if (ticket.status !== "paid") {
      ticket.status = "paid";
      await ticket.save();

      const eventDoc = await EventCollection.findById(ticket.event);
      if (eventDoc) {
        for (const item of ticket.tickets) {
          const ticketType = eventDoc.ticketTypes.id(item.ticketTypeId);
          if (ticketType) ticketType.sold += item.quantity;
        }
        await eventDoc.save();

        const pdfBuffer = await generateTicketPDF(ticket.toObject(), eventDoc);
        try {
          await sendTicketEmail(ticket, pdfBuffer, eventDoc);
          console.log("Ticket email sent successfully");
        } catch (err) {
          console.error("Email send error:", err.message);
        }
      }
    }

    console.log("Webhook log completed!");
    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(500);
  }
});

module.exports = router;