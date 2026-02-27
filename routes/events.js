const express = require("express");
const {
    createEvent,
    getAllEvents,
    getEventById,
    getMyEvents,
    updateEvent,
    deleteEvent,
} = require("../controllers/events");

const { authMiddleware, authorize } = require("../middlewares/auth");
const upload = require("../config/multer");

const router = express.Router();

/* ================= ADMIN ROUTES ================= */
router.get("/", getAllEvents);

/* ================= ORGANIZER ROUTES ================= */
router.get("/my-events", authMiddleware, authorize("organizer"), getMyEvents);
router.post(
    "/",
    authMiddleware,
    authorize("organizer"),
    upload.single("image"),
    createEvent
);

/* ================= SHARED ROUTES ================= */
router.get(
    "/:eventId",
    authMiddleware,
    authorize("admin", "organizer", "user"),
    getEventById
);

router.put(
    "/:eventId",
    authMiddleware,
    authorize("organizer"),
    upload.single("image"),
    updateEvent
);

router.delete(
    "/:eventId",
    authMiddleware,
    authorize("admin", "organizer"),
    deleteEvent
);

module.exports = router;
