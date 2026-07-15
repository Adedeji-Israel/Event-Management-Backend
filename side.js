const { signAccessToken, signRefreshToken, hashToken, REFRESH_TOKEN_EXPIRY_MS } = require("../utils/tokens");

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/auth", // scope cookie to auth routes only
    maxAge: REFRESH_TOKEN_EXPIRY_MS,
};

const issueTokens = async (res, user) => {
    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken();

    user.refreshTokenHash = hashToken(refreshToken);
    user.refreshTokenExpires = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);
    await user.save();

    res.cookie("refreshToken", refreshToken, cookieOptions);
    return accessToken;
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await UserCollection.findOne({ email: email.toLowerCase() }).select("+password");

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ status: "error", message: "Invalid email or password" });
        }

        const accessToken = await issueTokens(res, user);

        return res.status(200).json({
            status: "success",
            data: {
                user: { id: user._id, email: user.email, userName: user.userName, role: user.role },
                token: accessToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            return res.status(401).json({ status: "error", message: "No refresh token provided" });
        }

        const hashed = hashToken(refreshToken);
        const user = await UserCollection.findOne({
            refreshTokenHash: hashed,
            refreshTokenExpires: { $gt: Date.now() },
        }).select("+refreshTokenHash +refreshTokenExpires");

        if (!user) {
            res.clearCookie("refreshToken", cookieOptions);
            return res.status(401).json({ status: "error", message: "Invalid or expired session" });
        }

        // Rotate: issue a brand new refresh token, invalidate the old one
        const accessToken = await issueTokens(res, user);

        return res.status(200).json({
            status: "success",
            data: {
                user: { id: user._id, email: user.email, userName: user.userName, role: user.role },
                token: accessToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies;
        if (refreshToken) {
            await UserCollection.updateOne(
                { refreshTokenHash: hashToken(refreshToken) },
                { $unset: { refreshTokenHash: "", refreshTokenExpires: "" } }
            );
        }

        res.clearCookie("refreshToken", cookieOptions);
        return res.status(200).json({ status: "success", message: "Logged out successfully" });
    } catch (error) {
        next(error);
    }
};

module.exports = { login, refresh, logout /* ...other exports */ };



const {
    signAccessToken,
    signRefreshToken,
    hashToken,
    REFRESH_TOKEN_EXPIRY_MS,
} = require("../utils/generateTokens");
// remove the local `hashTokenn` definition — use `hashToken` everywhere below

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/auth",
    maxAge: REFRESH_TOKEN_EXPIRY_MS,
};

const issueTokens = async (res, user) => {
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken();

    user.refreshTokenHash = hashToken(refreshToken);
    user.refreshTokenExpires = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);
    await user.save();

    res.cookie("refreshToken", refreshToken, cookieOptions);
    return accessToken;
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: "error",
                message: "Email and password are required",
            });
        }

        const user = await UserCollection.findOne({ email: email.toLowerCase() }).select("+password");

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                status: "error",
                message: "Invalid email or password",
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                status: "error",
                message: "Please verify your account before logging in",
            });
        }

        const accessToken = await issueTokens(res, user); // sets refresh cookie + saves hash

        user.password = undefined;

        await sendLoginSuccessEmail(user.userName, email);

        return res.status(200).json({
            status: "success",
            message: "Login successful",
            data: { user, token: accessToken },
        });
    } catch (error) {
        next(error);
    }
};

// forgotPassword / resetPassword: unchanged except s/hashTokenn/hashToken/ throughout

