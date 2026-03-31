import api from "../services/api";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export async function registerPushNotifications() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

  try {
    // Register service worker
    const reg = await navigator.serviceWorker.register("/sw.js");

    // Ask permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    // Get VAPID public key from backend
    const { data } = await api.get("/push/vapid-public-key");
    const applicationServerKey = urlBase64ToUint8Array(data.key);

    // Subscribe
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    // Send subscription to backend
    await api.post("/push/subscribe", subscription);
  } catch (err) {
    console.error("[Push] Registration failed:", err);
  }
}
