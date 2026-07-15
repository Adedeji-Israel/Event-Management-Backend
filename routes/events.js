const express = require("express");
const {
    createEvent,
    getAllEvents,
    getEventById,
    getMyEvents,
    updateEvent,
    deleteEvent,
} = require("../controllers/events");

const { protect, authorize } = require("../middlewares/auth");
const upload = require("../config/multer");

const router = express.Router();

/* ================= ADMIN ROUTES ================= */
router.get("/", getAllEvents);

/* ================= ORGANIZER ROUTES ================= */
router.get("/my-events", protect, authorize("organizer"), getMyEvents);
router.post(
    "/create",
    protect,
    authorize("organizer"),
    upload.single("image"),
    createEvent
);

/* ================= SHARED ROUTES ================= */
router.get(
    "/:eventId",
    protect,
    authorize("admin", "organizer", "user"),
    getEventById
);

router.put(
    "/:eventId/edit",
    protect,
    authorize("organizer"),
    upload.single("image"),
    updateEvent
);

router.delete(
    "/:eventId/delete",
    protect,
    authorize("admin", "organizer"),
    deleteEvent
);

module.exports = router;
