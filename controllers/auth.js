const UserCollection = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotEnv = require("dotenv");
dotEnv.config();
const generateRandomString = require("../middlewares/generateRandomString");
const sendVerificationEmail = require("../services/email/sendVerificationEmail");
const sendResetPasswordEmail = require("../services/email/sendResetPasswordEmail");
const { generateAccessToken } = require("../utils/generateTokens");
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

    sendVerificationEmail(userName, email, verifyAccountUrl);

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

    const user = await UserCollection.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
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

    const accessToken = generateAccessToken(user);

    user.password = undefined;

    try {
      await sendLoginSuccessEmail(user.userName, email);
    } catch (error) {
      console.log("login email failed:", error);
    }

    return res.status(200).json({
      status: "success",
      message: "Login successful",
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

const logout = async (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Please provide an email"
      });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await UserCollection.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: `User with this email address: ${email} not found!`
      });
    }
    const userName = user.userName

    // Generate reset token
    const resetToken = generateRandomString(32);
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1-hour

    await user.save();

    const resetUrl = `${process.env.CLIENT_DOMAIN}/auth/reset-password/${resetToken}`

    await sendResetPasswordEmail(email, userName, resetUrl);

    return res.status(200).json({
      status: "success",
      message: "Password reset request received. Check your email for further instructions.",
      resetToken: resetToken,
      resetUrl: resetUrl,
    })

  } catch (error) {
    console.log(error);
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { resetPasswordToken } = req.params;

    const user = await UserCollection.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "Invalid or expired token"
      });
    }

    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        status: "error",
        message: "Please provide a valid new password (min. 8 characters)"
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({
      status: "success",
      message: "Password reset successful. You can now log in with your new password.",
    });
    // navigate back to the login page 

  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = {
  signup,
  login,
  authMe,
  // refreshAccessToken,
  logout,
  resetPassword,
  forgotPassword
};
