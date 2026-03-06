const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.use(
    "/webhook/paystack",
    express.raw({ type: "application/json" })
);

app.use("/webhook", require("./routes/webhook"));

app.use(cookieParser());

app.use(cors({
    origin: [
        "http://localhost:5174",
        "https://eventplace-sable.vercel.app" 
    ],
    credentials: true
}));

app.set("trust proxy", 1); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const errorHandler = require("./error/errorHandler");

const AuthRoutes = require("./routes/auth");
const UsersRoutes = require("./routes/users");
const EventRoutes = require("./routes/events");
const TicketRoutes = require("./routes/tickets");
const BookingRoutes = require("./routes/bookings");
const VerifyAccountRoutes = require("./routes/verifyAccount");
const DashboardRoutes = require("./routes/dashboard");

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/users", UsersRoutes);
app.use("/api/v1/events", EventRoutes);
app.use("/api/v1/tickets", TicketRoutes);
app.use("/api/v1/bookings", BookingRoutes);
app.use('/api/v1/auth/verify-account', VerifyAccountRoutes);
app.use("/api/v1/dashboard", DashboardRoutes);

app.all("*", (req, res) => {
    res.status(404).json({
        status: "error",
        message: `${req.method} ${req.originalUrl} is not an endpoint on this server. Check your method & request url again`
    });
});

app.use(errorHandler);

module.exports = app
