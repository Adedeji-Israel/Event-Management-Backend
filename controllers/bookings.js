const Booking = require("../models/booking");
const Event = require("../models/event");

/* ================= CREATE BOOKING ================= */
const createBooking = async (req, res, next) => {
  try {
    const { eventId, quantity, ticketName } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Find selected ticket type
    const ticket = event.ticketTypes.find(
      (t) => t.name === ticketName
    );

    if (!ticket) {
      return res.status(400).json({ message: "Invalid ticket type" });
    }

    const totalAmount = ticket.price * quantity;

    const booking = await Booking.create({
      user: req.user._id,   // 🔥 FIX HERE
      event: eventId,
      name: ticket.name,
      quantity,
      totalAmount,
      paymentStatus: "paid",
    });

    res.status(201).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    // console.log("Logged in user:", req.user);

    const bookings = await Booking.find({ user: req.user._id })
      .populate("event");

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
};
