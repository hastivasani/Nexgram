self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  const title = data.title || "Nexgram";
  const options = {
    body: data.body || "",
    icon: data.icon || "/LOGO.png",
    badge: "/LOGO.png",
    data: { url: data.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});
