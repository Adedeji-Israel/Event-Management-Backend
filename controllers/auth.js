const UserCollection = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const dotEnv = require("dotenv");
dotEnv.config();

const generateRandomString = require("../middlewares/generateRandomString");
const sendVerificationEmail = require("../services/email/sendVerificationEmail");
const sendResetPasswordEmail = require("../services/email/sendResetPasswordEmail");
const { signAccessToken, signRefreshToken, hashToken, REFRESH_TOKEN_EXPIRY_MS } = require("../utils/generateTokens");
const sendLoginSuccessEmail = require("../services/email/sendLoginSuccessEmail");

const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);

  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/api/v1/auth", // scope cookie to auth routes only
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

const signup = async (req, res, next) => {
  const { fullName, userName, email, password, dateOfBirth, gender, profilePicture } = req.body;
  try {
    if (!fullName || !userName || !email || !password || !dateOfBirth || !gender) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required to sign up!"
      });
    }
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No file uploaded!"
      });
    }

    req.body.profilePicture = req.file.path

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token and expiration
    const verificationToken = generateRandomString(24);
    const verificationExp = Date.now() + 3600000; // 1 hour expiration

    const age = calculateAge(req.body.dateOfBirth);
    if (age < 18) {
      return res.status(400).json({
        success: false,
        message: "You must be at least 18 years old to register",
      });
    }

    // Create user
    const user = await UserCollection.create({
      fullName,
      userName,
      email,
      password: hashedPassword,
      dateOfBirth: new Date(req.body.dateOfBirth),
      age: age,
      gender,
      role: "user",
      profilePicture: req.body.profilePicture,
      token: verificationToken,
      expDate: verificationExp
    });
    // manually add age 
    user.age = age

    const verifyAccountUrl = `${process.env.CLIENT_DOMAIN}/auth/verify-account/${verificationToken}`

    await sendVerificationEmail(userName, email, verifyAccountUrl);

    return res.status(201).json({
      status: "success",
      message: "Sign up successful!!!",
      data: user,
    });

  } catch (error) {
    console.error(error);
    next(error);
  }
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
    }).select("-password +refreshTokenHash +refreshTokenExpires");

    if (!user) {
      res.clearCookie("refreshToken", cookieOptions);
      return res.status(401).json({ status: "error", message: "Invalid or expired session" });
    }

    // Rotate: issue a brand new refresh token, invalidate the old one
    const accessToken = await issueTokens(res, user);

    // Strip sensitive fields before sending the user doc back to the client
    user.refreshTokenHash = undefined;
    user.refreshTokenExpires = undefined;

    return res.status(200).json({
      status: "success",
      data: {
        user,
        token: accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const authMe = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        status: "error",
        message: "Not authenticated",
      });
    }

    const user = await UserCollection.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { user },
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

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ status: "error", message: "Please provide an email" });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await UserCollection.findOne({ email: normalizedEmail });

    // Always respond the same way, whether or not the user exists
    const genericResponse = {
      status: "success",
      message: "If an account exists for this email, a reset link has been sent.",
    };

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    const resetToken = generateRandomString(32);
    user.resetPasswordToken = hashTokenn(resetToken); // store hash, not raw token
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_DOMAIN}/auth/reset-password/${resetToken}`;

    const emailResult = await sendResetPasswordEmail(user.userName, email, resetUrl);
    if (!emailResult.success) {
      // don't tell the client email failed (still avoid leaking info),
      // but log it for yourself
      console.error("Failed to send reset email:", emailResult.error);
    }

    return res.status(200).json(genericResponse);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { resetPasswordToken } = req.params;
    const hashedToken = hashTokenn(resetPasswordToken);

    const user = await UserCollection.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ status: "error", message: "Invalid or expired token" });
    }

    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        status: "error",
        message: "Please provide a valid new password (min. 8 characters)",
      });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      status: "success",
      message: "Password reset successful. You can now log in with your new password.",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = {
  signup,
  login,
  refresh,
  authMe,
  logout,
  resetPassword,
  forgotPassword
};
