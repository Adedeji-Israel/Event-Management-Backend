const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
const mongouri = process.env.MONGO_URL;

const connectToDb = async () => {
  try {
    const conn = await mongoose.connect(mongouri);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:");
    console.error("error: ", error);
    process.exit(1); // stop app if DB fails
  }
};

module.exports = connectToDb;
