/**
 * Service Worker - PWA Template with Best Practices
 * Based on lessons learned from multiple PWA projects
 */

// Inline logger for service worker (no ES6 modules support)
const isDev = () => {
  return self.location.hostname === 'localhost' || 
         self.location.hostname.includes('127.0.0.1') ||
         self.registration?.scope.includes('localhost');
};

const logger = {
  log: (...args) => { if (isDev()) logger.log(...args); },
  warn: (...args) => { if (isDev()) logger.warn(...args); },
  error: (...args) => { logger.error(...args); }, // Always log errors
  info: (emoji, ...args) => { if (isDev()) logger.log(emoji, ...args); }
};

const CACHE_VERSION = '1.0.0';
const CACHE_NAME = `pwa-template-cache-${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `pwa-template-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `pwa-template-dynamic-${CACHE_VERSION}`;

// Static assets to cache immediately
// NOTE: Only cache files that exist after build (no hashed filenames)
// JS/CSS assets with content hashes are cached dynamically via fetch event
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/build-info.json',
  '/assets/icon-192x192.png',
  '/assets/icon-512x512.png',
  '/assets/maskable-icon-192x192.png',
  '/assets/maskable-icon-512x512.png'
];

// Install Event - Cache static assets
self.addEventListener('install', (event) => {
  logger.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(async (cache) => {
        logger.log('📦 Caching static assets...');
        
        // Cache assets individually to handle failures gracefully
        const cachePromises = STATIC_ASSETS.map(async (url) => {
          try {
            await cache.add(url);
            logger.log(`✅ Cached: ${url}`);
          } catch (error) {
            logger.warn(`⚠️ Failed to cache ${url}:`, error.message);
            // Continue anyway - don't let one failure block the install
          }
        });
        
        await Promise.all(cachePromises);
        logger.log('✅ Service Worker install complete');
        
        // Force immediate activation
        return self.skipWaiting();
      })
      .catch(error => {
        logger.error('❌ Failed to open cache:', error);
        // Still skip waiting to avoid blocking
        return self.skipWaiting();
      })
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  logger.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Delete old caches that don't match current version
            if (cacheName.startsWith('pwa-template-') && 
                !cacheName.includes(CACHE_VERSION)) {
              logger.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        logger.log('✅ Service Worker activated successfully');
        // Take control of all clients immediately
        return self.clients.claim();
      })
      .catch(error => {
        logger.error('❌ Service Worker activation failed:', error);
      })
  );
});

// Fetch Event - Handle all network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Handle different types of requests
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

// Handle static assets (Cache First strategy)
async function handleStaticAsset(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      logger.log('📦 Serving from cache:', request.url);
      return cachedResponse;
    }
    
    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    // Cache the response for future use
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    logger.error('Failed to handle static asset:', request.url, error);
    return new Response('Asset not available', { status: 404 });
  }
}

// Handle API requests (Network First strategy)
async function handleAPIRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    logger.log('🌐 Network failed, trying cache for API:', request.url);
    
    // If network fails, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'This request is not available offline'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle dynamic requests (Stale While Revalidate strategy)
async function handleDynamicRequest(request) {
  try {
    // Try cache first for speed
    const cachedResponse = await caches.match(request);
    
    // Fetch from network in background
    const networkPromise = fetch(request).then(networkResponse => {
      if (networkResponse.ok) {
        // Clone BEFORE using the response to avoid "body already used" error
        const responseToCache = networkResponse.clone();
        caches.open(DYNAMIC_CACHE_NAME).then(cache => {
          cache.put(request, responseToCache);
        });
      }
      return networkResponse;
    }).catch(() => null);
    
    // Return cached response immediately if available
    if (cachedResponse) {
      logger.log('📦 Serving from cache (stale):', request.url);
      return cachedResponse;
    }
    
    // If no cache, wait for network
    const networkResponse = await networkPromise;
    if (networkResponse) {
      return networkResponse;
    }
    
    // If both fail, return offline page
    return new Response('Page not available offline', {
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error) {
    logger.error('Failed to handle dynamic request:', request.url, error);
    return new Response('Request failed', { status: 500 });
  }
}

// Helper functions
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') || url.hostname !== location.hostname;
}

// Message handling for cache busting
self.addEventListener('message', (event) => {
  const { action, data } = event.data;
  
  switch (action) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_BUST':
      handleCacheBust(data);
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches();
      break;
      
    case 'GET_CACHE_STATUS':
      getCacheStatus().then(status => {
        event.ports[0].postMessage({ action: 'CACHE_STATUS', data: status });
      });
      break;
      
    default:
      logger.log('Unknown message action:', action);
  }
});

// Handle cache busting
async function handleCacheBust(data) {
  try {
    const { strategy, resources } = data;
    
    switch (strategy) {
      case 'version-bump':
        await handleVersionBump();
        break;
        
      case 'signature-invalidation':
        await handleSignatureInvalidation(resources);
        break;
        
      case 'selective-clear':
        await handleSelectiveClear(resources);
        break;
        
      default:
        logger.log('Unknown cache bust strategy:', strategy);
    }
    
    // Notify clients of cache update
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        action: 'CACHE_UPDATED',
        strategy: strategy
      });
    });
  } catch (error) {
    logger.error('Cache bust failed:', error);
  }
}

async function handleVersionBump() {
  // Create new cache with incremented version
  const newVersion = incrementVersion(CACHE_VERSION);
  const newCacheName = `pwa-template-cache-${newVersion}`;
  
  // Copy current cache to new cache
  const currentCache = await caches.open(CACHE_NAME);
  const newCache = await caches.open(newCacheName);
  
  const requests = await currentCache.keys();
  await Promise.all(
    requests.map(request => 
      currentCache.match(request).then(response => 
        newCache.put(request, response)
      )
    )
  );
  
  logger.log('Cache version bumped to:', newVersion);
}

async function handleSignatureInvalidation(resources) {
  // Invalidate specific resources
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  
  for (const resource of resources) {
    await cache.delete(resource);
    logger.log('Invalidated resource:', resource);
  }
}

async function handleSelectiveClear(resources) {
  // Clear specific resources from all caches
  const cacheNames = await caches.keys();
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    for (const resource of resources) {
      await cache.delete(resource);
    }
  }
  
  logger.log('Selectively cleared resources:', resources);
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  logger.log('All caches cleared');
}

async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    status[cacheName] = {
      size: requests.length,
      urls: requests.map(req => req.url)
    };
  }
  
  return status;
}

function incrementVersion(version) {
  const parts = version.split('.');
  const patch = parseInt(parts[2]) + 1;
  return `${parts[0]}.${parts[1]}.${patch}`;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  logger.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Perform background sync operations
    logger.log('Performing background sync...');
    
    // Example: Sync offline data
    const offlineData = await getOfflineData();
    if (offlineData.length > 0) {
      await syncOfflineData(offlineData);
    }
    
    logger.log('Background sync completed');
  } catch (error) {
    logger.error('Background sync failed:', error);
  }
}

async function getOfflineData() {
  // Get data stored while offline
  return [];
}

async function syncOfflineData(data) {
  // Sync offline data with server
  logger.log('Syncing offline data:', data);
}

// Push notification handling
self.addEventListener('push', (event) => {
  logger.log('📱 Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/assets/icon-192x192.png',
    badge: '/assets/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/assets/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('PWA Template', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  logger.log('🔔 Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

logger.log('🔧 Service Worker script loaded');
