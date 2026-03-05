const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    fullName: {
        type: String,
        unique: true,
        required: true
    },
    userName: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        min: 6,
        max: 15,
        required: true,
        select: false
    },
    dateOfBirth: {
        type: Date,
        required: true,
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: true
    },
    profilePicture: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "organizer", "admin"],
        default: "user",
    },
    organizerRequest: {
        type: String,
        enum: ["none", "pending", "approved", "rejected"],
        default: "none",
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    token: {
        type: String,
        default: ""
    },
    expDate: {
        type: Date,
        default: ""
    },
    resetPasswordToken: {
        type: String,
        default: ""
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    }
},
    {
        timestamps: true,
    }
)

const userModel = mongoose.model("User", userSchema);

module.exports = userModel 
