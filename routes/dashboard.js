const express = require("express");
const { authMiddleware, authorize } = require("../middlewares/auth");
const { userOverview, userTickets, userUpcomingEvents, userPastEvents, organizerOverview, organizerEvents, organizerEventSales, organizerEventAttendees, getOrganizerEvents, adminOverview, adminUsers, adminOrganizers, adminEvents } = require("../controllers/dashboard");

const router = express.Router();

// USER DASHBOARD
router.get("/user/overview", authMiddleware, userOverview);
router.get("/user/tickets", authMiddleware, userTickets);
router.get("/user/upcoming-events", authMiddleware, userUpcomingEvents);
router.get("/user/past-events", authMiddleware, userPastEvents);

// ORGANIZER DASHBOARD
router.get("/organizer/overview", authMiddleware, organizerOverview);
router.get("/organizer/events", authMiddleware, organizerEvents);
router.get("/organizer/events/:eventId/sales", authMiddleware, organizerEventSales);
router.get("/organizer/events/:eventId/users", authMiddleware, organizerEventAttendees);
// router.get("/organizer/events", authMiddleware, authorize("organizer"), getOrganizerEvents);

// ADMIN DASHBOARD
router.get("/admin/overview", authMiddleware, adminOverview);
router.get("/admin/users", authMiddleware, adminUsers);
router.get("/admin/organizers", authMiddleware, adminOrganizers);
router.get("/admin/events", authMiddleware, adminEvents);

module.exports = router;
