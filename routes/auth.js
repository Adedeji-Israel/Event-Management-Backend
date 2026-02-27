const express = require("express");
const UserCollection = require('../models/user');
const upload = require("../config/multer");

const { signup, login, authMe, logout, forgotPassword, resetPassword } = require("../controllers/auth");
const { authMiddleware, authorize, protect } = require("../middlewares/auth");

const router = express.Router();

router.post("/signup", upload.single("profilePicture"), signup);
router.route("/login").post(login);
router.route("/me").get(protect, authMe);
router.route("/logout").post(protect, logout);  
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:resetPasswordToken").patch(resetPassword); 

// REQUEST ORGANIZER (SEPARATE ROUTE)
router.patch("/attendee/request-organizer", authMiddleware,
    async (req, res) => {
        try {
            if (req.user.role !== "user") {
                return res.status(400).json({
                    message: "Only attendees can request organizer access",
                });
            }

            if (req.user.organizerRequest === "pending") {
                return res.status(400).json({
                    message: "Organizer request already pending",
                });
            }

            await UserCollection.findByIdAndUpdate(req.user._id, {
                organizerRequest: "pending",
            });

            res.json({
                message: "Organizer request submitted successfully",
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

// ADMIN VIEW ORGANIZER REQUESTS 
router.get("/admin/organizer-requests", authMiddleware, authorize("admin"),
    async (req, res) => {
        const requests = await UserCollection.find({
            organizerRequest: "pending",
        }).select("fullName email dateOfBirth");

        res.json(requests);
    }
);

// ADMIN APPROVE ORGANIZER REQUESTS 
router.patch("/admin/approve-organizer/:id", authMiddleware, authorize("admin"),
    async (req, res) => {
        await UserCollection.findByIdAndUpdate(req.params.id, {
            role: "organizer",
            organizerRequest: "approved",
        });

        res.json({
            message: "User approved as organizer",
        });
    }
);

// OPTIONAL - ADMIN REJECT ORGANIZER REQUESTS
router.patch("/admin/reject-organizer/:id", authMiddleware, authorize("admin"),
    async (req, res) => {
        await UserCollection.findByIdAndUpdate(req.params.id, {
            organizerRequest: "rejected",
        });

        res.json({
            message: "Organizer request rejected",
        });
    }
);

module.exports = router 
