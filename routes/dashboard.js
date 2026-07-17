const express = require("express");
const { protect, authorize } = require("../middlewares/auth");
const { userOverview, userTickets, userUpcomingEvents, userPastEvents, organizerOverview, organizerEvents, organizerEventSales, organizerEventAttendees, adminOverview, adminUsers, adminOrganizers, adminEvents, requestOrganizer, viewRequests, approveRequest, rejectRequest } = require("../controllers/dashboard");

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

// ADMIN DASHBOARD
router.get("/admin/overview", protect, adminOverview);
router.get("/admin/users", protect, adminUsers);
router.get("/admin/organizers", protect, adminOrganizers);
router.get("/admin/events", protect, adminEvents);

//REQUESTS AND RESPONSE 
router.route("/user/request-organizer").patch(protect, authorize("user"), requestOrganizer);
router.route("/admin/organizer-requests").get(protect, authorize("admin"), viewRequests);
router.route("/admin/organizer-requests/:id/approve").patch(protect, authorize("admin"), approveRequest);
router.route("/admin/organizer-requests/:id/reject").patch(protect, authorize("admin"), rejectRequest);

module.exports = router;
