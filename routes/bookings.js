const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth");
const { createBooking, getMyBookings, } = require("../controllers/bookings");

router.post("/book", protect, authorize("user"), createBooking); 
router.get("/my-bookings", protect, authorize("user"), getMyBookings);

module.exports = router;
