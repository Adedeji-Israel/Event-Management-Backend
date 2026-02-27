const EventCollection = require("../models/event");
const TicketCollection = require("../models/ticket");

/* ================= GET ALL EVENTS ================= */
const getAllEvents = async (req, res, next) => {
  try {
    const events = await EventCollection.find()
      .populate("organizer", "fullName email")
      .lean();

    const tickets = await TicketCollection.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: "$event",
          bookingsCount: { $sum: 1 },
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]);

    const ticketMap = {};
    tickets.forEach((t) => (ticketMap[t._id.toString()] = t));

    const eventsWithStats = events.map((event) => ({
      ...event,
      bookingsCount: ticketMap[event._id]?.bookingsCount || 0,
      revenue: ticketMap[event._id]?.totalRevenue || 0,
    }));

    res.status(200).json({ status: "success", events: eventsWithStats });
  } catch (error) {
    next(error);
  }
};

/* ================= GET SINGLE EVENT ================= */
const getEventById = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    let event;

    if (req.user.role === "admin") {
      event = await EventCollection.findById(eventId)
        .populate("organizer", "fullName email");

    } else if (req.user.role === "organizer") {
      event = await EventCollection.findOne({
        _id: eventId,
        organizer: req.user._id,
      });

    } else {
      // 👇 For attendees/users
      event = await EventCollection.findById(eventId);
    }

    if (!event) {
      return res.status(404).json({
        status: "error",
        message: "Event not found",
      });
    }

    res.status(200).json({
      status: "success",
      event,
    });

  } catch (error) {
    next(error);
  }
};

/* ================= GET ORGANIZER EVENTS ================= */
const getMyEvents = async (req, res, next) => {
  try {
    const events = await EventCollection.find({
      organizer: req.user._id,
    }).lean();

    const tickets = await TicketCollection.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: "$event",
          bookingsCount: { $sum: 1 },
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]);

    const ticketMap = {};
    tickets.forEach((t) => (ticketMap[t._id.toString()] = t));

    const eventsWithStats = events.map((event) => ({
      ...event,
      bookingsCount: ticketMap[event._id]?.bookingsCount || 0,
      revenue: ticketMap[event._id]?.totalRevenue || 0,
    }));

    res.status(200).json({
      status: "success",
      eventsCount1: events.length,
      events: eventsWithStats,
    });
  } catch (error) {
    next(error);
  }
};

/* ================= CREATE EVENT ================= */
const createEvent = async (req, res, next) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "Event image required" });

    // title, description, date, time, location, image, organizer, status
    // ticketTypes .name .price .quantity .sold  
    const event = await EventCollection.create({
      ...req.body,
      image: req.file.path,
      organizer: req.user._id,
    });

    res.status(201).json({
      status: "success",
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    next(error);
  }
};

/* ================= UPDATE EVENT ================= */
const updateEvent = async (req, res, next) => {
  try {
    const event = await EventCollection.findById(req.params.eventId);

    if (!event)
      return res.status(404).json({ message: "Event not found" });

    // Only owner can update
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (req.file) {
      req.body.image = req.file.path;
    }

    const updated = await EventCollection.findByIdAndUpdate(
      req.params.eventId,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: "success",
      message: "Event updated successfully",
      event: updated,
    });
  } catch (error) {
    next(error);
  }
};

/* ================= DELETE EVENT ================= */
const deleteEvent = async (req, res, next) => {
  try {
    const event = await EventCollection.findById(req.params.eventId);

    if (!event)
      return res.status(404).json({ message: "Event not found" });

    // Organizer can delete only their event
    if (
      req.user.role === "organizer" &&
      event.organizer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await event.deleteOne();

    res.status(200).json({
      status: "success",
      message: "Event deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getMyEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
