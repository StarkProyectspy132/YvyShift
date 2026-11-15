/* Written with assistance from Claude (Anthropic) · Escrito con asistencia de Claude (Anthropic). La IA local es opcional (asistente-ia.js). */
/*
 * Service worker de YvyShift: guarda la app en el dispositivo para que funcione sin conexión.
 * Solo atiende archivos de este mismo sitio. Las descargas a NASA (POWER, GIBS) pasan directo a la red.
 * IMPORTANTE: subir VERSION cada vez que se publique una versión nueva de la app.
 */
const VERSION = 'yvy-v25';
// Caché aparte para la librería de la IA local: NO se borra al actualizar la app.
// El modelo en sí lo guarda WebLLM en sus propias cachés ("webllm/..."), que tampoco se tocan.
const IA_CACHE = 'yvy-ia-lib-0.2.88';
const IA_LIB = 'https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.88/';
const CORE = [
  './', 'index.html', 'styles.css', 'app.js', 'ui.js', 'terra.js', 'engine.js', 'manifest.webmanifest',
  'worldmap.js', 'life.js', 'campo.js', 'viz.js', 'asistente-ia.js', 'ia-worker.js', 'data/conocimiento.js', 'lang/gn.js', 'lang/pt.js', 'lang/ja.js', 'lang/hi.js', 'data/power_cache.js', 'data/enso_oni.js', 'data/validation.js',
  'data/img/modis_ndvi_2022-01-01.jpg', 'data/img/modis_ndvi_2024-01-01.jpg', 'data/img/modis_ndvi_2024-01-01_oriental.jpg',
  'data/img/fondo-campo-1920.webp', 'data/img/fondo-campo-960.webp', 'data/img/hls_itapua_2022-01-24_L30.jpg', 'data/img/hls_itapua_2024-01-03_S30.jpg',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    // Solo se borran versiones viejas de la app (yvy-v*, rl-v*), nunca la IA instalada.
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION && /^(yvy-v|rl-v)/.test(k)).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

// Primero lo guardado (rápido y sin conexión); en segundo plano se actualiza para la próxima vez.
self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  // Librería de la IA local: primero lo guardado, así funciona sin conexión una vez instalada.
  if (req.url.startsWith(IA_LIB)) {
    e.respondWith(caches.open(IA_CACHE).then(async (cache) => {
      const hit = await cache.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    }));
    return;
  }
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const hit = await cache.match(req, { ignoreSearch: true });
      const net = fetch(req).then((res) => { if (res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
      if (hit) { e.waitUntil(net); return hit; }
      const res = await net;
      if (res) return res;
      if (req.mode === 'navigate') return (await cache.match('index.html')) || Response.error();
      return Response.error();
    })
  );
});
