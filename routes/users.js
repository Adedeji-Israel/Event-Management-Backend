const express = require("express");
const { getAllUsers, deleteAllUsers, deleteSingleUser, getSingleUser } = require("../controllers/users");
const { authMiddleware, authorize } = require("../middlewares/auth");

const router = express.Router();

router.route("/")
    .get(authMiddleware, authorize("admin"), getAllUsers)
    .delete(authMiddleware, authorize("admin"), deleteAllUsers);

router.route("/:userId")
    .get(authMiddleware, authorize("admin"), getSingleUser)
    .delete(authMiddleware, authorize("admin"), deleteSingleUser);

module.exports = router
