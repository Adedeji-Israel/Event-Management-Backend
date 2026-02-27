const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "1h" }
);

// const generateRefreshToken = (user) => jwt.sign(
//     { id: user._id, email: user.email, role: user.role },
//     process.env.REFRESH_TOKEN_SECRET_KEY,
//     { expiresIn: "7d" }
// );


module.exports = {
    generateAccessToken,
    // generateRefreshToken
};

    // const refreshToken = generateRefreshToken(user);

    // const refreshToken = req.cookies.refreshToken;
    
        // if (refreshToken) {
        //     const user = await UserCollection.findOne({ refreshToken });
        //     if (user) {
        //         user.refreshToken = null;
        //         await user.save();
        //     }
        // }
        
        // res.clearCookie("refreshToken");

// 🔐 REFRESH TOKEN COOKIE (LONG LIVED)
// res.cookie("refreshToken", refreshToken, {
//   httpOnly: true,
//   secure: process.env.NODE_ENV === "production",
//   sameSite: "strict",
//   maxAge: 7 * 24 * 60 * 60 * 1000,
// });

// const refreshAccessToken = async (req, res) => {
//   try {
//     const refreshToken = req.cookies.refreshToken;
//     if (!refreshToken) {
//       return res.status(401).json({ message: "No refresh token" });
//     }

//     const decoded = jwt.verify(
//       refreshToken,
//       process.env.REFRESH_TOKEN_SECRET_KEY
//     );

//     const user = await User.findById(decoded.id);
//     if (!user || user.refreshToken !== refreshToken) {
//       return res.status(403).json({ message: "Invalid refresh token" });
//     }

//     const newAccessToken = generateAccessToken(user);

//     res.cookie("accessToken", newAccessToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 15 * 60 * 1000,
//     });

//     return res.status(200).json({ status: "success" });
//   } catch {
//     return res.status(403).json({ message: "Refresh token expired" });
//   }
// };
