const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const webpush = require("web-push");
const User = require("../models/User");

// Lazy init — only set VAPID details when env vars are available
function ensureVapid() {
  if (
    process.env.VAPID_EMAIL &&
    process.env.VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY
  ) {
    try {
      webpush.setVapidDetails(
        process.env.VAPID_EMAIL,
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );
      return true;
    } catch (_) {
      return false;
    }
  }
  return false;
}

// Save push subscription
router.post("/subscribe", protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { pushSubscription: req.body });
    res.json({ message: "Subscribed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove push subscription
router.post("/unsubscribe", protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { pushSubscription: null });
    res.json({ message: "Unsubscribed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get VAPID public key
router.get("/vapid-public-key", (req, res) => {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) return res.status(503).json({ error: "Push not configured" });
  res.json({ key });
});

module.exports = router;
