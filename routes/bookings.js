const express = require("express");
const router = express.Router();
const { authMiddleware, authorize } = require("../middlewares/auth");
const { createBooking, getMyBookings, } = require("../controllers/bookings");

router.post("/book", authMiddleware, authorize("user"), createBooking); 
router.get("/my-bookings", authMiddleware, authorize("user"), getMyBookings);

module.exports = router;
