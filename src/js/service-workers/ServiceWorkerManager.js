/**
 * Service Worker Manager - Handles service worker registration and updates
 * Based on lessons learned from multiple PWA projects
 */

class ServiceWorkerManager {
  constructor() {
    this.registration = null;
    this.isSupported = 'serviceWorker' in navigator;
    this.isInitialized = false;
    this.updateCallbacks = [];
    this.installCallbacks = [];
  }

  async initialize() {
    if (this.isInitialized || !this.isSupported) return;
    
    console.log('🔧 Initializing Service Worker Manager...');
    
    try {
      // Register service worker
      await this.register();
      
      // Set up event listeners
      this.setupEventListeners();
      
      this.isInitialized = true;
      console.log('✅ Service Worker Manager initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Service Worker Manager:', error);
      throw error;
    }
  }

  async register() {
    if (!this.isSupported) {
      console.warn('Service Worker not supported in this browser');
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('✅ Service Worker registered successfully');
      return this.registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      throw error;
    }
  }

  setupEventListeners() {
    if (!this.isSupported) return;

    // Listen for service worker updates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Service Worker controller changed');
      this.handleControllerChange();
    });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      this.handleServiceWorkerMessage(event);
    });

    // Listen for service worker state changes
    if (this.registration) {
      this.registration.addEventListener('updatefound', () => {
        console.log('🔄 Service Worker update found');
        this.handleUpdateFound();
      });
    }
  }

  handleControllerChange() {
    // Reload the page to use the new service worker
    window.location.reload();
  }

  handleServiceWorkerMessage(event) {
    const { action, data } = event.data;
    
    switch (action) {
      case 'CACHE_UPDATED':
        this.handleCacheUpdated(data);
        break;
      case 'UPDATE_AVAILABLE':
        this.handleUpdateAvailable(data);
        break;
      case 'INSTALL_READY':
        this.handleInstallReady(data);
        break;
      default:
        console.log('Unknown service worker message:', action);
    }
  }

  handleUpdateFound() {
    const newWorker = this.registration.installing;
    
    if (newWorker) {
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // New service worker is available
            console.log('🔄 New service worker is available');
            this.handleUpdateAvailable();
          } else {
            // Service worker is installed for the first time
            console.log('✅ Service worker installed for the first time');
            this.handleInstallReady();
          }
        }
      });
    }
  }

  handleCacheUpdated(data) {
    console.log('📦 Cache updated:', data);
    
    this.updateCallbacks.forEach(callback => {
      try {
        callback({ type: 'cache-updated', data });
      } catch (error) {
        console.error('Error in update callback:', error);
      }
    });
  }

  handleUpdateAvailable(data) {
    console.log('🔄 Update available:', data);
    
    this.updateCallbacks.forEach(callback => {
      try {
        callback({ type: 'update-available', data });
      } catch (error) {
        console.error('Error in update callback:', error);
      }
    });
  }

  handleInstallReady(data) {
    console.log('✅ Install ready:', data);
    
    this.installCallbacks.forEach(callback => {
      try {
        callback({ type: 'install-ready', data });
      } catch (error) {
        console.error('Error in install callback:', error);
      }
    });
  }

  // Public API
  async checkForUpdates() {
    if (!this.registration) {
      console.warn('No service worker registration found');
      return false;
    }

    try {
      await this.registration.update();
      console.log('✅ Update check completed');
      return true;
    } catch (error) {
      console.error('❌ Update check failed:', error);
      return false;
    }
  }

  async updateApp() {
    if (!this.registration || !this.registration.waiting) {
      console.warn('No waiting service worker found');
      return false;
    }

    try {
      // Tell the waiting service worker to skip waiting and become active
      this.registration.waiting.postMessage({ action: 'SKIP_WAITING' });
      console.log('✅ App update initiated');
      return true;
    } catch (error) {
      console.error('❌ App update failed:', error);
      return false;
    }
  }

  async installApp() {
    // This would typically be handled by the browser's install prompt
    // For now, we'll just log it
    console.log('📱 App install requested');
    
    this.installCallbacks.forEach(callback => {
      try {
        callback({ type: 'install-requested' });
      } catch (error) {
        console.error('Error in install callback:', error);
      }
    });
    
    return true;
  }

  async clearCaches() {
    if (!('caches' in window)) {
      console.warn('Cache API not supported');
      return false;
    }

    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('✅ All caches cleared');
      return true;
    } catch (error) {
      console.error('❌ Failed to clear caches:', error);
      return false;
    }
  }

  async clearSpecificCache(cacheName) {
    if (!('caches' in window)) {
      console.warn('Cache API not supported');
      return false;
    }

    try {
      await caches.delete(cacheName);
      console.log(`✅ Cache cleared: ${cacheName}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to clear cache ${cacheName}:`, error);
      return false;
    }
  }

  async getCacheStatus() {
    if (!('caches' in window)) {
      return { error: 'Cache API not supported' };
    }

    try {
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
    } catch (error) {
      console.error('Failed to get cache status:', error);
      return { error: error.message };
    }
  }

  // Event System
  onUpdate(callback) {
    this.updateCallbacks.push(callback);
  }

  onInstall(callback) {
    this.installCallbacks.push(callback);
  }

  // Cache Busting
  async bustCache(strategy, resources = []) {
    if (!this.registration || !this.registration.active) {
      console.warn('No active service worker found');
      return false;
    }

    try {
      this.registration.active.postMessage({
        action: 'CACHE_BUST',
        data: { strategy, resources }
      });
      console.log(`✅ Cache bust initiated: ${strategy}`);
      return true;
    } catch (error) {
      console.error('❌ Cache bust failed:', error);
      return false;
    }
  }

  async getServiceWorkerStatus() {
    if (!this.registration) {
      return { status: 'not-registered' };
    }

    const status = {
      status: 'registered',
      state: this.registration.active ? this.registration.active.state : 'no-active-worker',
      scope: this.registration.scope,
      updateViaCache: this.registration.updateViaCache
    };

    if (this.registration.waiting) {
      status.waitingWorker = true;
    }

    if (this.registration.installing) {
      status.installingWorker = true;
    }

    return status;
  }

  // Debug Methods
  getStatus() {
    return {
      isSupported: this.isSupported,
      isInitialized: this.isInitialized,
      hasRegistration: !!this.registration,
      hasActiveWorker: !!(this.registration && this.registration.active),
      hasWaitingWorker: !!(this.registration && this.registration.waiting),
      hasInstallingWorker: !!(this.registration && this.registration.installing)
    };
  }

  // Utility Methods
  async unregister() {
    if (!this.registration) {
      console.warn('No service worker registration to unregister');
      return false;
    }

    try {
      const result = await this.registration.unregister();
      console.log('✅ Service worker unregistered');
      this.registration = null;
      return result;
    } catch (error) {
      console.error('❌ Failed to unregister service worker:', error);
      return false;
    }
  }

  async getRegistrations() {
    if (!this.isSupported) {
      return [];
    }

    try {
      return await navigator.serviceWorker.getRegistrations();
    } catch (error) {
      console.error('Failed to get service worker registrations:', error);
      return [];
    }
  }

  // Force Update
  async forceUpdate() {
    if (!this.registration) {
      console.warn('No service worker registration found');
      return false;
    }

    try {
      // Clear all caches first
      await this.clearCaches();
      
      // Force update
      await this.registration.update();
      
      // If there's a waiting worker, activate it
      if (this.registration.waiting) {
        this.registration.waiting.postMessage({ action: 'SKIP_WAITING' });
      }
      
      console.log('✅ Force update completed');
      return true;
    } catch (error) {
      console.error('❌ Force update failed:', error);
      return false;
    }
  }
}

// Export as ES module
export default ServiceWorkerManager;
