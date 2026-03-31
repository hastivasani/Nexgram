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
 * @param {string|object} userId - recipient user ID
 * @param {object} payload - { title, body, icon, url, image, tag }
 */
async function sendPushNotification(userId, payload) {
  if (!ensureVapid()) return;
  try {
    const user = await User.findById(userId).select("pushSubscription");
    if (!user?.pushSubscription) return;

    const notification = {
      title:   payload.title || "Nexgram",
      body:    payload.body  || "",
      icon:    payload.icon  || "/LOGO.png",
      badge:   "/LOGO.png",
      url:     payload.url   || "/",
      tag:     payload.tag   || "nexgram",
      image:   payload.image || undefined,
    };

    await webpush.sendNotification(
      user.pushSubscription,
      JSON.stringify(notification)
    );
  } catch (err) {
    if (err.statusCode === 410 || err.statusCode === 404) {
      // Subscription expired — clean it up
      await User.findByIdAndUpdate(userId, { pushSubscription: null });
    }
  }
}

module.exports = sendPushNotification;
