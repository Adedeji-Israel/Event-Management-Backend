const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const dotEnv = require("dotenv");
dotEnv.config();

const ACCESS_TOKEN_EXPIRY = "30m";
const REFRESH_TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const signAccessToken = (user) =>
    jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET_KEY,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

const signRefreshToken = () => crypto.randomBytes(40).toString("hex");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

module.exports = {
    signAccessToken,
    signRefreshToken,
    hashToken,
    REFRESH_TOKEN_EXPIRY_MS,
};
