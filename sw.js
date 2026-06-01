const CACHE_NAME = 'a3-prompt-pwa-v25';
const LOCAL_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png'
];
const CDN_ASSETS = [
  'https://cdn.tailwindcss.com/3.4.17',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(LOCAL_SHELL).then(() =>
        Promise.allSettled(CDN_ASSETS.map((asset) => cache.add(asset)))
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
