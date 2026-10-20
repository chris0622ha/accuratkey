// Service worker: installable app + light offline support.
//  - /_next/static and /icons are content-hashed/immutable -> cache-first.
//  - Page navigations are network-first (always the latest deploy when online) and the
//    last good page is kept so the app shell can open offline.
//  - API and Firebase calls are never touched.
const STATIC = "ak-static-v1", PAGES = "ak-pages-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (![STATIC, PAGES].includes(k)) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener("fetch", (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin || u.pathname.startsWith("/api/")) return;
  if (u.pathname.startsWith("/_next/static/") || u.pathname.startsWith("/icons/")) {
    e.respondWith(caches.open(STATIC).then(async (c) => (await c.match(r)) || fetch(r).then((res) => { if (res.ok) c.put(r, res.clone()); return res; })));
    return;
  }
  if (r.mode === "navigate") {
    e.respondWith(fetch(r).then((res) => { if (res.ok) { const cp = res.clone(); caches.open(PAGES).then((c) => c.put(r, cp)); } return res; })
      .catch(async () => (await caches.match(r)) || (await caches.match("/game")) || new Response(
        "<!doctype html><meta name=viewport content='width=device-width,initial-scale=1'><body style='background:#0a0a0f;color:#e0e0ff;font-family:system-ui;display:grid;place-items:center;height:100vh;margin:0;text-align:center'><div><h2>You're offline</h2><p>Open AccuratKey once while online, then it can start offline.</p></div>",
        { headers: { "Content-Type": "text/html" } })));
  }
});
