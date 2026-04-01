const mongoose = require("mongoose");
const dns = require("dns");

// Force IPv4 DNS resolution - fixes Render's SRV lookup issues
dns.setDefaultResultOrder("ipv4first");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    console.log("[DB] Connecting to MongoDB...");

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    });

    console.log(`[DB] MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("[DB] MongoDB connection error:", error.message);
    console.log("[DB] Retrying in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
