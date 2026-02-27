const jwt = require('jsonwebtoken');
const UserCollection = require('../models/user');
const dotEnv = require("dotenv");
dotEnv.config();
const clearAuthData = require("../utils/clearAuthData");

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                status: "error",
                message: "Authorization token missing or invalid",
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

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth error:", error.message);
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
                return res.status(403).json({ message: "Access denied" });
            }
            next();
        };

const verifyTokenOptional = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await UserCollection.findById(decoded.id);

        if (!user) {
            clearAuthData(res);
            req.user = null;
            return next();
        }
        req.user = user;
        next();
    } catch (error) {
        clearAuthData(res);
        req.user = null;
        next();
    }
};

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Not authorized, no token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = { id: decoded.id }; // ✅ attach user id to request

    next();
  } catch (error) {
    console.error("protect error: ", error); 

    return res.status(401).json({
      status: "error",
      message: "Token invalid or expired",
    });
  }
};

module.exports = {
    authMiddleware,
    authorize,
    protect, 
    verifyTokenOptional
};
