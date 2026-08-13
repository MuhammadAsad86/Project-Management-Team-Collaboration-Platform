const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/database");

let isConnected = false;

const connectDatabase = async () => {
  if (isConnected) {
    return;
  }

  await connectDB();

  isConnected = true;
};

const handler = async (req, res) => {
  try {
    await connectDatabase();
    return app(req, res);
  } catch (error) {
    console.error("Database connection error:", error);

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
};

module.exports = handler;