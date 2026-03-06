const TicketCollection = require("../models/ticket");
const EventCollection = require("../models/event");
const { initializePayment, verifyPayment } = require("../utils/paystack");
const dotEnv = require("dotenv");
dotEnv.config();

const FRONTEND_URL = process.env.CLIENT_DOMAIN

/* ================= BOOK TICKET ================= */
const bookTicket = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { tickets } = req.body;

    const event = await EventCollection.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    let totalAmount = 0;
    let totalQuantity = 0;
    const processedTickets = [];
    const seenTypes = new Set();

    for (const item of tickets) {
      const { ticketTypeId, quantity } = item;
      if (!ticketTypeId)
        return res.status(400).json({ message: "Ticket type ID is required" });

      const qty = Number(quantity);
      if (!qty || qty < 1)
        return res.status(400).json({ message: "Invalid quantity" });

      if (seenTypes.has(ticketTypeId))
        return res.status(400).json({ message: "Duplicate ticket type selected" });

      seenTypes.add(ticketTypeId);

      const ticketType = event.ticketTypes.id(ticketTypeId);
      if (!ticketType)
        return res.status(400).json({ message: "Invalid ticket type" });

      if (ticketType.sold + qty > ticketType.quantity)
        return res.status(400).json({ message: `${ticketType.name} sold out` });

      totalAmount += ticketType.price * qty;
      totalQuantity += qty;

      processedTickets.push({
        ticketTypeId: ticketType._id,
        name: ticketType.name,
        price: ticketType.price,
        quantity: qty,
      });
    }

    const amountInKobo = totalAmount * 100;

    const initResponse = await initializePayment({
      email: req.user.email,
      amount: amountInKobo,
      metadata: {
        userId: req.user._id.toString(),
        eventId: eventId.toString(),
        tickets: processedTickets,
      },
      callback_url: `${FRONTEND_URL}/events/payment/verify`,
    });

    if (!initResponse.status)
      return res.status(400).json({ message: "Payment initialization failed" });

    const reference = initResponse.data.reference;

    // ✅ Create ticket document properly
    const ticketDoc = await TicketCollection.create({
      event: eventId,
      user: req.user._id,
      name: req.user.fullName || `${req.user.firstName} ${req.user.lastName}` || req.user.email,
      email: req.user.email,
      tickets: processedTickets,
      totalQuantity,
      amount: totalAmount,
      paymentReference: reference,
    });

    console.log("Ticket items:", ticketDoc.tickets); // ✅ logs actual ticket items

    res.status(200).json({
      authorizationUrl: initResponse.data.authorization_url,
      reference,
      ticket: ticketDoc,
    });
  } catch (error) {
    next(error);
  }
};

/* ================= CONFIRM PAYMENT ================= */
const confirmTicketPayment = async (req, res, next) => {
  try {
    const { reference } = req.query;

    if (!reference)
      return res.status(400).json({ message: "Reference is required" });

    const ticket = await TicketCollection.findOne({
      paymentReference: reference,
    }).populate("event", "title date location");

    if (!ticket)
      return res.status(404).json({ message: "Ticket not found" });

    // ✅ Verify directly with Paystack
    const paystackResponse = await verifyPayment(reference);

    if (!paystackResponse.status) {
      return res.status(400).json({ message: "Verification failed" });
    }

    const paymentData = paystackResponse.data;

    if (paymentData.status !== "success") {
      return res.status(400).json({ message: "Payment not successful" });
    }

    // ✅ Only update once
    if (ticket.status !== "paid") {
      const eventDoc = await EventCollection.findById(ticket.event);
      if (!eventDoc)
        return res.status(404).json({ message: "Event not found" });

      // Update inventory safely
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

    return res.status(200).json({
      message: "Payment successful",
      ticket,
    });

  } catch (error) {
    console.error("Confirm payment error:", error);
    next(error);
  }
};

/* ================= ADMIN: ALL TICKETS ================= */
const getAllTickets = async (req, res, next) => {
  try {
    const tickets = await TicketCollection.find()
      .populate("event", "title date")
      .populate("user", "fullName email");

    res.status(200).json({ status: "success", tickets });
  } catch (error) {
    next(error);
  }
};

/* ================= ORGANIZER: ALL BOOKED TICKETS ================= */
const getBookedTickets = async (req, res, next) => {
  try {
    const events = await EventCollection.find({ organizer: req.user._id }).select("_id");

    const eventIds = events.map(event => event._id);

    const tickets = await TicketCollection.find({
      event: { $in: eventIds },
      status: "paid"
    })
      .populate("event", "title date location")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      count: tickets.length,
      tickets
    });

  } catch (error) {
    next(error);
  }
};

/* ================= USER: MY TICKETS ================= */
const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await TicketCollection.find({
      user: req.user._id,
      status: "paid"
    })
      .populate("event", "title date location image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      tickets
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookTicket,
  confirmTicketPayment,
  getAllTickets,
  getBookedTickets,
  getMyTickets,
};
