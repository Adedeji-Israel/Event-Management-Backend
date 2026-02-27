const User = require("../models/user");
const Ticket = require("../models/ticket");
const Event = require("../models/event");

const mongoose = require("mongoose");

// USER DASHBOARD OVERVIEW
const userOverview = async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Access denied" });
    }

    const userId = req.user.id;

    const totalTickets = await Ticket.countDocuments({ user: userId });

    const upcomingTickets = await Ticket.countDocuments({
      user: userId,
      eventDate: { $gte: new Date() },
    });

    res.status(200).json({
      success: true,
      data: {
        totalTickets,
        upcomingTickets,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// USER TICKETS
const userTickets = async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Access denied" });
    }

    const tickets = await Ticket.find({ user: req.user.id })
      .populate("event", "title date location banner")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tickets" });
  }
};

// USER UPCOMING EVENTS
const userUpcomingEvents = async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Access denied" });
    }

    const events = await Ticket.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $lookup: {
          from: "events",
          localField: "event",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: "$event" },
      {
        $match: {
          "event.date": { $gte: new Date() },
        },
      },
      {
        $project: {
          _id: 0,
          ticketId: "$_id",
          title: "$event.title",
          date: "$event.date",
          location: "$event.location",
          banner: "$event.banner",
        },
      },
      { $sort: { date: 1 } },
    ]);

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch upcoming events" });
  }
};

// USER PAST EVENTS
const userPastEvents = async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Access denied" });
    }

    const events = await Ticket.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $lookup: {
          from: "events",
          localField: "event",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: "$event" },
      {
        $match: {
          "event.date": { $lt: new Date() },
        },
      },
      {
        $project: {
          _id: 0,
          ticketId: "$_id",
          title: "$event.title",
          date: "$event.date",
          location: "$event.location",
          banner: "$event.banner",
        },
      },
      { $sort: { date: -1 } },
    ]);

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch past events" });
  }
};

// ORGANIZER DASHBOARD OVERVIEW
const organizerOverview = async (req, res) => {
  try {
    if (req.user.role !== "organizer") {
      return res.status(403).json({ message: "Access denied" });
    }

    const organizerId = req.user.id;

    const totalEvents = await Event.countDocuments({
      organizer: organizerId,
    });

    const activeEvents = await Event.countDocuments({
      organizer: organizerId,
      date: { $gte: new Date() },
    });

    res.status(200).json({
      success: true,
      data: {
        totalEvents,
        activeEvents,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ORGANIZER EVENTS
const organizerEvents = async (req, res) => {
  try {
    if (req.user.role !== "organizer") {
      return res.status(403).json({ message: "Access denied" });
    }

    const events = await Event.find({ organizer: req.user.id })
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

// ORGANIZER EVENT SALES
const organizerEventSales = async (req, res) => {
  try {
    if (req.user.role !== "organizer") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { eventId } = req.params;

    const event = await Event.findOne({
      _id: eventId,
      organizer: req.user.id,
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const totalTicketsSold = await Ticket.countDocuments({
      event: eventId,
    });

    const revenue = totalTicketsSold * event.ticketPrice;

    res.status(200).json({
      success: true,
      data: {
        eventId,
        eventTitle: event.title,
        totalTicketsSold,
        revenue,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch sales data" });
  }
};

// ORGANIZER EVENT ATTENDEES
const organizerEventAttendees = async (req, res) => {
  try {
    if (req.user.role !== "organizer") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { eventId } = req.params;

    const event = await Event.findOne({
      _id: eventId,
      organizer: req.user.id,
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const users = await Ticket.find({ event: eventId })
      .populate("user", "name email");

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch attendees" });
  }
};

// ADMIN OVERVIEW
const adminOverview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const totalUsers = await User.countDocuments({ role: "user" });
    const totalOrganizers = await User.countDocuments({ role: "organizer" });
    const totalEvents = await Event.countDocuments();

    const statsAgg = await Ticket.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: null,
          totalTicketsSold: { $sum: "$totalQuantity" },
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]);

    const totalTicketsSold = statsAgg[0]?.totalTicketsSold || 0;
    const totalRevenue = statsAgg[0]?.totalRevenue || 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalOrganizers,
        totalEvents,
        totalTicketsSold,
        totalRevenue,
      },
    });

  } catch (error) {
    console.error("Admin overview error:", error);
    res.status(500).json({
      message: "Failed to fetch admin overview",
      error: error.message,
    });
  }
};

// ADMIN USERS
const adminUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// ADMIN ORGANIZERS
const adminOrganizers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const organizers = await User.find({ role: "organizer" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: organizers.length,
      data: organizers,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch organizers" });
  }
};

// ADMIN EVENTS
const adminEvents = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const events = await Event.find()
      .populate("organizer", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
};


module.exports = {
  userOverview,
  userTickets,
  userUpcomingEvents,
  userPastEvents,
  organizerOverview,
  organizerEvents,
  // getOrganizerEvents, 
  organizerEventSales,
  organizerEventAttendees,
  adminOverview,
  adminUsers,
  adminOrganizers,
  adminEvents,
};
