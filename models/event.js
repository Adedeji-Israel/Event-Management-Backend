const mongoose = require("mongoose");

const ticketTypeSchema = new mongoose.Schema({
    name: { 
        type: String,
        enum: ["VIP", "Regular"], 
        default: "Regular"
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    sold: {
        type: Number,
        default: 0
    }
});

const eventSchema = mongoose.Schema({
    title: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["draft", "live", "ended"],
        default: "draft",
    },

    // 👇 Ticket categories
    ticketTypes: [ticketTypeSchema],

    // 👇 Dashboard helpers
    totalTicketsSold: {
        type: Number,
        default: 0
    },
    totalRevenue: {
        type: Number,
        default: 0
    },
},
    { timestamps: true } 

);

module.exports = mongoose.model('Event', eventSchema);
