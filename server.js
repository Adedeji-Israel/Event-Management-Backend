require("./dnsFix.js"); 

const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const connectToDb = require("./config/connectToDB");

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  await connectToDb();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port: ${PORT}`);
  });
};

startServer();
