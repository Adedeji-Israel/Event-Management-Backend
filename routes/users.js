const express = require("express");
const { getAllUsers, deleteAllUsers, deleteSingleUser, getSingleUser } = require("../controllers/users");
const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();

router.route("/")
    .get(protect, authorize("admin"), getAllUsers)
    .delete(protect, authorize("admin"), deleteAllUsers);

router.route("/:userId")
    .get(protect, authorize("admin"), getSingleUser)
    .delete(protect, authorize("admin"), deleteSingleUser);

module.exports = router
