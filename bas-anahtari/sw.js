// Bas Anahtarı — çevrimdışı önbellek
const CACHE = "bas-anahtari-v3";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-64.png", "icon-180.png", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("bas-anahtari-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Önce ağ (güncel sürüm), ağ yoksa önbellek. Google Fonts da önbelleğe alınır, yazı tipleri çevrimdışı çalışır.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  const font = u.hostname === "fonts.googleapis.com" || u.hostname === "fonts.gstatic.com";
  if (u.origin !== location.origin && !font) return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request, {ignoreSearch: true}).then(r => r || caches.match("index.html")))
  );
});
