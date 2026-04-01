const TicketCollection = require("../models/ticket");
const EventCollection = require("../models/event");
const { initializePayment, verifyPayment } = require("../utils/paystack");
const { processSuccessfulPayment } = require("./processSuccessfulPayment");
require("dotenv").config();

const FRONTEND_URL = process.env.CLIENT_DOMAIN;

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
      const qty = Number(quantity);
      if (!ticketTypeId || !qty || qty < 1)
        return res.status(400).json({ message: "Invalid ticket selection" });

      if (seenTypes.has(ticketTypeId))
        return res.status(400).json({ message: "Duplicate ticket type selected" });
      seenTypes.add(ticketTypeId);

      const ticketType = event.ticketTypes.id(ticketTypeId);
      if (!ticketType) return res.status(400).json({ message: "Invalid ticket type" });

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

    const ticketDoc = await TicketCollection.create({
      event: eventId,
      user: req.user._id,
      name: req.user.fullName,
      email: req.user.email,
      tickets: processedTickets,
      totalQuantity,
      amount: totalAmount,
      paymentReference: reference,
      status: "pending"
    });

    return res.status(200).json({
      success: true,
      authorizationUrl: initResponse.data.authorization_url,
      reference,
      ticket: ticketDoc,
    });

  } catch (error) {
    next(error);
  }
};

/* ================= GET PAYMENT STATUS ================= */
const getPaymentStatus = async (req, res) => {

  const { reference } = req.query;

  if (!reference) {
    return res.status(400).json({ message: "Reference required" });
  }

  let ticket = await TicketCollection
    .findOne({ paymentReference: reference })
    .populate("event", "title date location");

  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  if (ticket.status === "paid") {
    return res.json({ ticket });
  }

  try {
    const paystackRes = await verifyPayment(reference);

    if (paystackRes.status && paystackRes.data.status === "success") {

      await processSuccessfulPayment(ticket);

      ticket = await TicketCollection
        .findById(ticket._id)
        .populate("event", "title date location");
    }
  } catch (err) {
    console.error("Verify fallback error:", err.message);
  }

  return res.json({ ticket });
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
  getPaymentStatus,
  getAllTickets,
  getBookedTickets,
  getMyTickets,
};
