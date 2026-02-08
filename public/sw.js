// Service Worker for cache management
const CACHE_NAME = 'ghost-rider-v' + Date.now();
const STATIC_CACHE_NAME = 'ghost-rider-static-v' + Date.now();

// Files to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request).then((fetchResponse) => {
          // Don't cache API calls or auth-related requests
          if (event.request.url.includes('/api/') || 
              event.request.url.includes('supabase') ||
              event.request.url.includes('auth')) {
            return fetchResponse;
          }

          // Cache successful responses
          if (fetchResponse.status === 200) {
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }

          return fetchResponse;
        });
      })
      .catch(() => {
        // Fallback for offline scenarios
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Handle sign out - clear all caches
  if (event.data && event.data.type === 'SIGN_OUT') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      // Notify that caches are cleared
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'CACHES_CLEARED' });
        });
      });
    });
  }
});