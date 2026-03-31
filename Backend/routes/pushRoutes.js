const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const webpush = require("web-push");
const User = require("../models/User");

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Save push subscription
router.post("/subscribe", auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { pushSubscription: req.body });
    res.json({ message: "Subscribed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove push subscription
router.post("/unsubscribe", auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { pushSubscription: null });
    res.json({ message: "Unsubscribed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get VAPID public key
router.get("/vapid-public-key", (req, res) => {
  res.json({ key: process.env.VAPID_PUBLIC_KEY });
});

module.exports = router;
