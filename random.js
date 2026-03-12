// const nodemailer = require("nodemailer");
// const { google } = require("googleapis");

// // OAuth2 client setup
// const oAuth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   "https://developers.google.com/oauthplayground"
// );

// // Set refresh token
// oAuth2Client.setCredentials({
//   refresh_token: process.env.GOOGLE_REFRESH_TOKEN
// });

// // Create transporter with automatic token refresh
// async function createTransporter() {
//   try {
//     const accessToken = await oAuth2Client.getAccessToken();

//     return nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         type: "OAuth2",
//         user: process.env.APP_EMAIL,
//         clientId: process.env.GOOGLE_CLIENT_ID,
//         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//         refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
//         accessToken: accessToken.token,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Failed to create transporter:", error);
//     throw error;
//   }
// }

// // Verify connection
// async function verifyConnection() {
//   try {
//     const transporter = await createTransporter();
//     await transporter.verify();
//     console.log("✅ Mailer ready with OAuth2");
//     console.log("📧 Connected as:", process.env.APP_EMAIL);
//     return true;
//   } catch (error) {
//     console.error("❌ Mailer connection failed:", error.message);
//     return false;
//   }
// }

// // Send email function
// async function sendMail(mailOptions) {
//   try {
//     const transporter = await createTransporter();
//     const result = await transporter.sendMail(mailOptions);
//     console.log("✅ Email sent successfully!");
//     console.log("📨 Message ID:", result.messageId);
//     return result;
//   } catch (error) {
//     console.error("❌ Email failed:", error);
//     throw error;
//   }
// }

// // Quick test function
// async function testEmail() {
//   try {
//     const isConnected = await verifyConnection();
//     if (!isConnected) {
//       console.error("❌ Cannot send test - connection failed");
//       return;
//     }

//     await sendMail({
//       from: `"Test" <${process.env.APP_EMAIL}>`,
//       to: process.env.APP_EMAIL,
//       subject: "✅ OAuth2 Test Successful",
//       html: `
//         <div style="font-family: sans-serif; padding: 20px;">
//           <h2>Your OAuth2 Setup Works!</h2>
//           <p>Your refresh token is valid and working.</p>
//           <p>You can now send emails from your Node.js app.</p>
//         </div>
//       `
//     });

//     console.log("🎉 Test email sent! Check your inbox.");
//   } catch (error) {
//     console.error("❌ Test failed:", error);
//   }
// }

// // If this file is run directly
// if (require.main === module) {
//   require('dotenv').config();
//   testEmail();
// }

// // Export BOTH the sendMail function and the verify function
// module.exports = {
//   verifyConnection,
//   sendMail  // This is what your route needs
// };