const CACHE_NAME = 'solo-institutional-v3';
const OFFLINE_URL = '/offline.html';

const ASSETS_TO_CACHE = [
    '/',
    '/dashboard',
    '/dashboard/pos',
    '/manifest.json',
    '/favicon.ico',
    '/styles/globals.css'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;

            return fetch(event.request).then((response) => {
                // Check if we should cache this response
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // Cache static assets dynamically
                const url = new URL(event.request.url);
                if (url.origin === self.location.origin &&
                    (url.pathname.startsWith('/_next/static') || url.pathname.endsWith('.png') || url.pathname.endsWith('.svg'))) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }

                return response;
            }).catch(() => {
                // If fetch fails and it's a navigation request, show offline page if available
                if (event.request.mode === 'navigate') {
                    return caches.match(OFFLINE_URL);
                }
            });
        })
    );
});
