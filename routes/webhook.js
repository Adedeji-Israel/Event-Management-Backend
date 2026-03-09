// routes/webhook.js
const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const TicketCollection = require("../models/ticket");
const EventCollection = require("../models/event");
const generateTicketPDF = require("../utils/generateTicketPDF");
const sendTicketEmail = require("../utils/sendTicketEmail");

router.post("/paystack", async (req, res) => {
    try {
        console.log("PAYSTACK WEBHOOK RECEIVED");

        const hash = crypto
            .createHmac("sha512", process.env.PAYSTACK_SECRET)
            .update(req.body.toString())
            .digest("hex");

        if (hash !== req.headers["x-paystack-signature"]) {
            console.log("Invalid signature");
            return res.status(401).send("Invalid signature");
        }

        const payload = JSON.parse(req.body.toString());

        if (payload.event !== "charge.success") {
            return res.sendStatus(200);
        }

        const reference = payload.data.reference;

        const ticket = await TicketCollection.findOne({
            paymentReference: reference,
        });

        if (!ticket || ticket.status === "paid") {
            return res.sendStatus(200);
        }

        const eventDoc = await EventCollection.findById(ticket.event);

        for (const item of ticket.tickets) {
            const ticketType = eventDoc.ticketTypes.id(item.ticketTypeId);
            if (ticketType) {
                ticketType.sold += item.quantity;
            }
        }

        await eventDoc.save();

        ticket.status = "paid";
        await ticket.save();

        const pdfBuffer = await generateTicketPDF(ticket.toObject(), eventDoc);

        try {
            await sendTicketEmail(ticket, pdfBuffer, eventDoc);
            console.log("TICKET EMAIL SENT SUCCESSFULLY!!!");
        } catch (error) {
            console.log("email ticket error: ", error);
        }
        
        console.log("Webhook completed successfully");

        res.sendStatus(200);

    } catch (error) {
        console.error("Webhook Error:", error);
        res.sendStatus(500);
    }
});

module.exports = router;