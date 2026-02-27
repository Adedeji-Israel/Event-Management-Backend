const express = require("express");

const verifyAccount = require("../controllers/verifyAccount");

const router = express.Router();

router.get("/:verificationToken", verifyAccount); // Matches `/api/v1/auth/verify/:token`

module.exports = router;
