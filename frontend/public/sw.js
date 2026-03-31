self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  const title = data.title || "Nexgram";
  const options = {
    body:    data.body  || "",
    icon:    data.icon  || "/LOGO.png",
    badge:   "/LOGO.png",
    image:   data.image || undefined,
    vibrate: [200, 100, 200],
    tag:     data.tag   || "nexgram-notification",
    renotify: true,
    data:    { url: data.url || "/" },
    actions: data.actions || [],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If app already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// Keep service worker active
self.addEventListener("install",  () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(clients.claim()));
