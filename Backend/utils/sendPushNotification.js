const webpush = require("web-push");
const User = require("../models/User");

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * Send a push notification to a user
 * @param {string} userId - recipient user ID
 * @param {object} payload - { title, body, icon, url }
 */
async function sendPushNotification(userId, payload) {
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
