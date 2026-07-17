const express = require("express");
const UserCollection = require('../models/user');
const upload = require("../config/multer");

const { signup, login, refresh, authMe, logout, forgotPassword, resetPassword } = require("../controllers/auth");
const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();

router.post("/signup", upload.single("profilePicture"), signup);
router.route("/login").post(login);
router.route("/me").get(protect, authMe);
router.route("/refresh").post(refresh);
router.route("/logout").post(protect, logout);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:resetPasswordToken").patch(resetPassword);

module.exports = router 
