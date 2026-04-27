/**
 * PAL Delivery service worker — handles push notifications for
 * runners. Registered by the runner hub when notifications are
 * enabled. Receives push events from PAL's server (web-push +
 * VAPID), displays them, opens the relevant order page on tap.
 *
 * Kept minimal on purpose — no offline caching, no precaching,
 * just push. Update strategy: bump SW_VERSION below to bust cache.
 */

// eslint-disable-next-line no-unused-vars
const SW_VERSION = "pal-runner-push-1";

self.addEventListener("install", (event) => {
  // Activate immediately on install — no skip-waiting dance needed
  // because we're not caching pages.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Take control of all open clients (hub tabs) immediately so push
  // works without a refresh.
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  // Defensive parse — server always sends JSON but some push services
  // strip payloads under odd conditions. Fall back to a generic ping.
  let payload = {
    title: "PAL Delivery",
    body: "New order ready to claim",
    url: "/deliver/driver",
    tag: undefined,
  };
  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch (_) {
      // text() fallback — non-JSON
      try {
        payload.body = event.data.text() || payload.body;
      } catch (_) {
        // give up; use defaults
      }
    }
  }

  const opts = {
    body: payload.body,
    icon: "/logos/lighthouse-icon.svg",
    badge: "/logos/lighthouse-icon.svg",
    tag: payload.tag, // notifications with same tag replace each other
    data: { url: payload.url },
    requireInteraction: false,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(payload.title, opts));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/deliver/driver";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If a hub tab is already open, focus it + navigate. Else open new.
        for (const client of clientList) {
          if (
            client.url.includes("/deliver/driver") &&
            "focus" in client &&
            "navigate" in client
          ) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
        return null;
      }),
  );
});
