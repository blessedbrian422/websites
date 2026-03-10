const CACHE_NAME = 'bible-notes-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  'index.html',
  'style.css',
  'app.js',
  'favicon.png',
  'icon-512.png',
  'manifest.json',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200',
'/bible'
];

// =========================
// Install Event
// =========================
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

