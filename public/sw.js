// Simple service worker to allow PWA installability
self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
    // Pass through fetch
    e.respondWith(fetch(e.request));
});
