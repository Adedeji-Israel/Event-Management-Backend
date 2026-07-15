const express = require("express");
const { protect, authorize } = require("../middlewares/auth");
const { userOverview, userTickets, userUpcomingEvents, userPastEvents, organizerOverview, organizerEvents, organizerEventSales, organizerEventAttendees, getOrganizerEvents, adminOverview, adminUsers, adminOrganizers, adminEvents } = require("../controllers/dashboard");

const router = express.Router();

// USER DASHBOARD
router.get("/user/overview", protect, userOverview);
router.get("/user/tickets", protect, userTickets);
router.get("/user/upcoming-events", protect, userUpcomingEvents);
router.get("/user/past-events", protect, userPastEvents);

// ORGANIZER DASHBOARD
router.get("/organizer/overview", protect, organizerOverview);
router.get("/organizer/events", protect, organizerEvents);
router.get("/organizer/events/:eventId/sales", protect, organizerEventSales);
router.get("/organizer/events/:eventId/users", protect, organizerEventAttendees);
// router.get("/organizer/events", protect, authorize("organizer"), getOrganizerEvents);

// ADMIN DASHBOARD
router.get("/admin/overview", protect, adminOverview);
router.get("/admin/users", protect, adminUsers);
router.get("/admin/organizers", protect, adminOrganizers);
router.get("/admin/events", protect, adminEvents);

module.exports = router;
