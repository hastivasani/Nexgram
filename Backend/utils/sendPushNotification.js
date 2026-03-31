const webpush = require("web-push");
const User = require("../models/User");

let vapidInitialized = false;

function ensureVapid() {
  if (vapidInitialized) return true;
  if (
    process.env.VAPID_EMAIL &&
    process.env.VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY
  ) {
    webpush.setVapidDetails(
      process.env.VAPID_EMAIL,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    vapidInitialized = true;
    return true;
  }
  return false;
}

/**
 * Send a push notification to a user
 * @param {string} userId - recipient user ID
 * @param {object} payload - { title, body, icon, url }
 */
async function sendPushNotification(userId, payload) {
  if (!ensureVapid()) return; // VAPID not configured, skip silently
  try {
    const user = await User.findById(userId).select("pushSubscription");
    if (!user?.pushSubscription) return;

    await webpush.sendNotification(
      user.pushSubscription,
      JSON.stringify(payload)
    );
  } catch (err) {
    // Subscription expired — clean it up
    if (err.statusCode === 410) {
      await User.findByIdAndUpdate(userId, { pushSubscription: null });
    }
  }
}

module.exports = sendPushNotification;
