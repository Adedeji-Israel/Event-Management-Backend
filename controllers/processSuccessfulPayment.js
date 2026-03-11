const EventCollection = require("../models/event");
const generateTicketPDF = require("../utils/generateTicketPDF");
const sendTicketEmail = require("../services/email/sendTicketEmail");

const processSuccessfulPayment = async (ticket) => {

    if (ticket.status === "paid") return;

    const eventDoc = await EventCollection.findById(ticket.event);

    if (!eventDoc) {
        throw new Error("Event not found");
    }

    // update ticket inventory
    for (const item of ticket.tickets) {

        const ticketType = eventDoc.ticketTypes.id(item.ticketTypeId);

        if (ticketType) {
            ticketType.sold += item.quantity;
        }
    }

    await eventDoc.save();

    // update ticket status
    ticket.status = "paid";
    await ticket.save();

    // generate ticket pdf
    const pdfBuffer = await generateTicketPDF(ticket.toObject(), eventDoc);

    // send email
    await sendTicketEmail(ticket, pdfBuffer, eventDoc);
};

module.exports = {
    processSuccessfulPayment
};