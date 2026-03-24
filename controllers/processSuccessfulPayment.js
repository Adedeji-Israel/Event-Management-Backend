const EventCollection = require("../models/event");
const generateTicketPDF = require("../utils/generateTicketPDF");
const sendTicketEmail = require("../services/email/sendTicketEmail");
const TicketCollection = require("../models/ticket");

const processSuccessfulPayment = async (ticket) => {
    try {
        console.log("⚡ Processing payment for:", ticket._id);

        // 🔒 Prevent duplicate processing
        if (ticket.status === "paid" && ticket.emailSent) {
            console.log("⚠️ Already processed");
            return;
        }

        const eventDoc = await EventCollection.findById(ticket.event);

        if (!eventDoc) {
            throw new Error("Event not found");
        }

        // 🎟 Update ticket inventory (ONLY if not already paid)
        if (ticket.status !== "paid") {
            for (const item of ticket.tickets) {
                const ticketType = eventDoc.ticketTypes.id(item.ticketTypeId);

                if (ticketType) {
                    ticketType.sold += item.quantity;
                }
            }

            await eventDoc.save();

            ticket.status = "paid";
            await ticket.save();
        }

        // 📄 Generate PDF
        const pdfBuffer = await generateTicketPDF(ticket.toObject(), eventDoc);

        // 📧 Send email ONLY if not already sent
        if (!ticket.emailSent) {
            await sendTicketEmail(ticket, pdfBuffer, eventDoc);

            await TicketCollection.findByIdAndUpdate(ticket._id, {
                emailSent: true,
            });

            console.log("📧 Ticket email sent");
        }

        console.log("✅ Payment processing complete");

    } catch (error) {
        console.error("❌ processSuccessfulPayment error:", error);

        // 🔁 Optional retry logic hook
        // (you can queue this later)
    }
};

module.exports = {
    processSuccessfulPayment
};