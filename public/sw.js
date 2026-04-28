/**
 * PAL service worker — push notifications for every PAL role:
 *   - delivery runners (order alerts)
 *   - Wheelhouse participants (awaiting:<you> alerts)
 *   - cart-rental vendors (new bookings)
 *   - locals sellers (new sales)
 *   - restaurants (new delivery orders)
 *   - customer topics (event drops, dispatch)
 *
 * Push payload is always { title, body, url, tag? } — the click
 * handler routes by URL, so adding a new subscriber kind is purely
 * a server-side config change.
 *
 * Kept minimal on purpose — no offline caching, no precaching,
 * just push. Update strategy: bump SW_VERSION below to bust cache.
 */

// eslint-disable-next-line no-unused-vars
const SW_VERSION = "pal-push-2";

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
    title: "Port A Local",
    body: "New activity in PAL",
    url: "/",
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
  const targetUrl = event.notification.data?.url || "/";

  // Reuse an existing same-origin tab whose URL shares the first path
  // segment as the target (so a Wheelhouse notification opens in the
  // existing Wheelhouse tab, not the runner tab). Else open new.
  const target = new URL(targetUrl, self.location.origin);
  const targetFirstSeg = target.pathname.split("/")[1] || "";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          try {
            const c = new URL(client.url);
            const cFirstSeg = c.pathname.split("/")[1] || "";
            if (
              cFirstSeg === targetFirstSeg &&
              "focus" in client &&
              "navigate" in client
            ) {
              client.navigate(targetUrl);
              return client.focus();
            }
          } catch (_) {
            // ignore parse failures, keep iterating
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
        return null;
      }),
  );
});
