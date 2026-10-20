// Minimal service worker: makes the app installable and shows a friendly offline page.
// It never caches app pages or API calls, so users always get the latest deploy.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  if (e.request.mode !== "navigate") return;
  e.respondWith(fetch(e.request).catch(() => new Response(
    "<!doctype html><meta name=viewport content='width=device-width,initial-scale=1'><body style='background:#0a0a0f;color:#e0e0ff;font-family:system-ui;display:grid;place-items:center;height:100vh;margin:0;text-align:center'><div><h2>You're offline</h2><p>AccuratKey needs a connection. Reconnect and reopen.</p></div>",
    { headers: { "Content-Type": "text/html" } })));
});
