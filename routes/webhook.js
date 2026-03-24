const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const TicketCollection = require("../models/ticket");
const { processSuccessfulPayment } = require("../controllers/processSuccessfulPayment");

router.post("/paystack", async (req, res) => {
    try {
        console.log("WEBHOOK HIT STARTED");

        const hash = crypto
            .createHmac("sha512", process.env.PAYSTACK_SECRET)
            .update(req.body.toString())
            .digest("hex");

        if (hash !== req.headers["x-paystack-signature"]) {
            return res.status(401).send("Invalid signature");
        }

        const payload = JSON.parse(req.body);

        if (payload.event !== "charge.success") {
            return res.sendStatus(200);
        }

        const reference = payload.data.reference;

        const ticket = await TicketCollection.findOne({
            paymentReference: reference
        });

        if (!ticket) {
            console.log("Ticket not found for reference:", reference);
            return res.sendStatus(200);
        }

        // 🔒 Prevent duplicate email sending
        if (ticket.emailSent) {
            console.log("⚠️ Email already sent for this ticket");
            return res.sendStatus(200);
        }

        // ⚡ Run async (DO NOT BLOCK WEBHOOK)
        processSuccessfulPayment(ticket).catch(err => {
            console.error("Async payment processing failed:", err);
        });

        console.log("WEBHOOK HIT ENDED");

        res.sendStatus(200);

    } catch (error) {
        console.error("Webhook error:", error);
        res.sendStatus(500);
    }
});

module.exports = router;