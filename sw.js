const CACHE = "conversor-v4.1";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon.svg"];

// 1. Forzar al nuevo Service Worker a instalarse de inmediato
self.addEventListener("install", e => {
  self.skipWaiting(); // <--- CLAVE: No esperar a que se cierre la app
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

// 2. Forzar al nuevo Service Worker a tomar el control de todas las pestañas
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()) // <--- CLAVE: Tomar el control ya
  );
});

// 3. Estrategia "Network First" agresiva
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  
  e.respondWith(
    fetch(e.request).then(res => {
      // Si hay internet, trae lo nuevo y actualiza la caché
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => {
      // Si no hay internet, usa la copia guardada
      return caches.match(e.request);
    })
  );
});
