const UserCollection = require("../models/user");
const sendVerificationSuccessEmail = require("../services/email/sendVerificationSuccessEmail");

const verifyAccount = async (req, res, next) => {
    try {
        const { verificationToken } = req.params;

        const user = await UserCollection.findOne({ token: verificationToken });
        if (!user) {
            return res.status(400).json({
                status: "error",
                message: "Invalid or expired verification token!"
            });
        }

        if (user.expDate < Date.now()) {
            return res.status(400).json({
                status: "error",
                message: "Verification token has expired! Request for a new one"
            });
        }

        user.isVerified = true; // Mark user as verified
        user.token = undefined; // Remove token after verification
        user.expDate = undefined;
        await user.save();

        const email = user.email
        const userName = user.userName
        const loginUrl = `${process.env.CLIENT_DOMAIN}/auth/login`

        sendVerificationSuccessEmail(userName, email, loginUrl);

        return res.status(200).json({
            status: "success",
            message: "Your account has been successfully verified! You can now log in",
            loginUrl: loginUrl
        });

    } catch (error) {
        console.error("Verification Error:", error); 
        next(error);
    }
};

module.exports = verifyAccount;
