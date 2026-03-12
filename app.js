const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cors({
    origin: [
        "http://localhost:5174",
        "https://eventplace-sable.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());

app.use("/api/v1/webhook/paystack", express.raw({ type: "*/*" }));

app.use(cookieParser());

app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Routes */
app.use("/api/v1/webhook", require("./routes/webhook"));

const AuthRoutes = require("./routes/auth");
const UsersRoutes = require("./routes/users");
const EventRoutes = require("./routes/events");
const TicketRoutes = require("./routes/tickets");
const BookingRoutes = require("./routes/bookings");
const VerifyAccountRoutes = require("./routes/verifyAccount");
const DashboardRoutes = require("./routes/dashboard");

if (process.env.NODE_ENV === "development") {
    const devTestRoutes = require("./routes/devTestRoutes");

    app.use("/api/v1/dev", devTestRoutes);
}

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/users", UsersRoutes);
app.use("/api/v1/events", EventRoutes);
app.use("/api/v1/tickets", TicketRoutes);
app.use("/api/v1/bookings", BookingRoutes);
app.use("/api/v1/auth/verify-account", VerifyAccountRoutes);
app.use("/api/v1/dashboard", DashboardRoutes);

/* 404 */
app.all("*", (req, res) => {
    res.status(404).json({
        status: "error",
        message: `${req.method} ${req.originalUrl} is not an endpoint on this server.`
    });
});

const errorHandler = require("./error/errorHandler");
app.use(errorHandler);

module.exports = app;