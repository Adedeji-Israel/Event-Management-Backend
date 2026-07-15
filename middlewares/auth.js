const jwt = require('jsonwebtoken');
const UserCollection = require('../models/user');
const dotEnv = require("dotenv");
dotEnv.config();
const clearAuthData = require("../utils/clearAuthData");

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({
                status: "error",
                message: "Not authorized, no token",
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        const user = await UserCollection.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({
                status: "error",
                message: "User not found!",
            });
        }

        req.user = user; // full user doc — role, email, etc. all available downstream
        next();
    } catch (error) {
        console.error("protect error:", error.message);
        return res.status(401).json({
            status: "error",
            message: "Invalid or expired token",
        });
    }
};

const authorize =
    (...roles) =>
        (req, res, next) => {
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({ status: "error", message: "Access denied" });
            }
            next();
        };

const verifyTokenOptional = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        req.user = null;
        return next();
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await UserCollection.findById(decoded.id).select("-password");
        req.user = user || null;
        next();
    } catch (error) {
        req.user = null;
        next();
    }
};

module.exports = {
    protect,
    authorize,
    verifyTokenOptional,
};
