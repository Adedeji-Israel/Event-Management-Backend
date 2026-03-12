// create a file called debug-env.js
require('dotenv').config();

console.log("=== ENVIRONMENT VARIABLES CHECK ===");
console.log("APP_EMAIL:", process.env.APP_EMAIL);
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "✅ Present" : "❌ Missing");
console.log("GOOGLE_CLIENT_ID length:", process.env.GOOGLE_CLIENT_ID?.length);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "✅ Present" : "❌ Missing");
console.log("GOOGLE_REFRESH_TOKEN:", process.env.GOOGLE_REFRESH_TOKEN ? "✅ Present" : "❌ Missing");
console.log("GOOGLE_REFRESH_TOKEN length:", process.env.GOOGLE_REFRESH_TOKEN?.length);
