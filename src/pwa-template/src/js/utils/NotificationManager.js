/**
 * Notification Manager - Handles PWA notifications with best practices
 * Based on lessons learned from multiple PWA projects
 */

class NotificationManager {
  constructor() {
    this.permission = 'default';
    this.isSupported = 'Notification' in window;
    this.isInitialized = false;
    this.notificationCallbacks = [];
  }

  async initialize() {
    if (this.isInitialized || !this.isSupported) return;
    
    console.log('🔔 Initializing Notification Manager...');
    
    try {
      // Check current permission status
      this.permission = Notification.permission;
      
      // Set up event listeners
      this.setupEventListeners();
      
      this.isInitialized = true;
      console.log('✅ Notification Manager initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Notification Manager:', error);
      throw error;
    }
  }

  setupEventListeners() {
    // Listen for permission changes
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'notifications' }).then(result => {
        result.addEventListener('change', () => {
          this.permission = result.state;
          this.notifyPermissionChange();
        });
      });
    }
  }

  async requestPermission() {
    if (!this.isSupported) {
      console.warn('Notifications not supported in this browser');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
        this.notifyPermissionChange();
        return true;
      } else {
        console.log('❌ Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  async show(title, options = {}) {
    if (!this.isSupported) {
      console.warn('Notifications not supported');
      return null;
    }

    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    try {
      const notificationOptions = {
        body: options.body || '',
        icon: options.icon || '/assets/icon-192x192.png',
        badge: options.badge || '/assets/badge-72x72.png',
        image: options.image || undefined,
        tag: options.tag || 'default',
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        vibrate: options.vibrate || [100, 50, 100],
        data: options.data || {},
        actions: options.actions || [],
        timestamp: options.timestamp || Date.now(),
        ...options
      };

      const notification = new Notification(title, notificationOptions);
      
      // Set up click handler
      notification.onclick = (event) => {
        event.preventDefault();
        this.handleNotificationClick(notification, event);
        notification.close();
      };

      // Set up close handler
      notification.onclose = () => {
        this.handleNotificationClose(notification);
      };

      // Set up error handler
      notification.onerror = (error) => {
        console.error('Notification error:', error);
        this.handleNotificationError(notification, error);
      };

      // Auto-close after 5 seconds if not requiring interaction
      if (!notificationOptions.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      console.log('🔔 Notification shown:', title);
      return notification;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return null;
    }
  }

  async showUpdateAvailable() {
    return this.show('Update Available', {
      body: 'A new version of the app is available. Click to update.',
      tag: 'update-available',
      requireInteraction: true,
      actions: [
        {
          action: 'update',
          title: 'Update Now',
          icon: '/assets/update.png'
        },
        {
          action: 'later',
          title: 'Later',
          icon: '/assets/later.png'
        }
      ],
      data: { type: 'update' }
    });
  }

  async showOfflineMode() {
    return this.show('You\'re Offline', {
      body: 'Some features may not be available while offline.',
      tag: 'offline-mode',
      icon: '/assets/offline.png',
      data: { type: 'offline' }
    });
  }

  async showOnlineMode() {
    return this.show('Back Online', {
      body: 'You\'re connected to the internet again.',
      tag: 'online-mode',
      icon: '/assets/online.png',
      data: { type: 'online' }
    });
  }

  async showInstallPrompt() {
    return this.show('Install App', {
      body: 'Install this app on your device for a better experience!',
      tag: 'install-prompt',
      requireInteraction: true,
      actions: [
        {
          action: 'install',
          title: 'Install',
          icon: '/assets/install.png'
        },
        {
          action: 'dismiss',
          title: 'Not Now',
          icon: '/assets/dismiss.png'
        }
      ],
      data: { type: 'install' }
    });
  }

  async showCustom(title, body, options = {}) {
    return this.show(title, {
      body,
      ...options
    });
  }

  // Event Handlers
  handleNotificationClick(notification, event) {
    console.log('🔔 Notification clicked:', notification.tag);
    
    const action = event.action || 'default';
    const data = notification.data || {};
    
    // Notify callbacks
    this.notificationCallbacks.forEach(callback => {
      try {
        callback({
          type: 'click',
          action,
          data,
          notification
        });
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });
    
    // Handle specific actions
    switch (action) {
      case 'update':
        this.handleUpdateAction();
        break;
      case 'install':
        this.handleInstallAction();
        break;
      case 'later':
      case 'dismiss':
        // Do nothing
        break;
      default:
        // Focus the app window
        this.focusApp();
    }
  }

  handleNotificationClose(notification) {
    console.log('🔔 Notification closed:', notification.tag);
    
    this.notificationCallbacks.forEach(callback => {
      try {
        callback({
          type: 'close',
          data: notification.data || {},
          notification
        });
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });
  }

  handleNotificationError(notification, error) {
    console.error('🔔 Notification error:', error);
    
    this.notificationCallbacks.forEach(callback => {
      try {
        callback({
          type: 'error',
          error,
          data: notification.data || {},
          notification
        });
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });
  }

  handleUpdateAction() {
    // Trigger app update
    if (window.pwaApp && window.pwaApp.serviceWorkerManager) {
      window.pwaApp.serviceWorkerManager.updateApp();
    }
  }

  handleInstallAction() {
    // Trigger app install
    if (window.pwaApp && window.pwaApp.serviceWorkerManager) {
      window.pwaApp.serviceWorkerManager.installApp();
    }
  }

  focusApp() {
    // Focus the app window
    if (window.focus) {
      window.focus();
    }
  }

  // Event System
  onNotificationEvent(callback) {
    this.notificationCallbacks.push(callback);
  }

  notifyPermissionChange() {
    this.notificationCallbacks.forEach(callback => {
      try {
        callback({
          type: 'permission-change',
          permission: this.permission
        });
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });
  }

  // Utility Methods
  isPermissionGranted() {
    return this.permission === 'granted';
  }

  isPermissionDenied() {
    return this.permission === 'denied';
  }

  canRequestPermission() {
    return this.permission === 'default';
  }

  getPermissionStatus() {
    return this.permission;
  }

  // Clear all notifications
  clearAll() {
    if ('serviceWorker' in navigator && 'getRegistration' in navigator.serviceWorker) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration && 'getNotifications' in registration) {
          registration.getNotifications().then(notifications => {
            notifications.forEach(notification => notification.close());
          });
        }
      });
    }
  }

  // Schedule notification
  schedule(title, options, delay) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.show(title, options).then(resolve);
      }, delay);
    });
  }

  // Cancel scheduled notifications
  cancel(tag) {
    if ('serviceWorker' in navigator && 'getRegistration' in navigator.serviceWorker) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration && 'getNotifications' in registration) {
          registration.getNotifications({ tag }).then(notifications => {
            notifications.forEach(notification => notification.close());
          });
        }
      });
    }
  }

  // Debug Methods
  getStatus() {
    return {
      isSupported: this.isSupported,
      isInitialized: this.isInitialized,
      permission: this.permission,
      canRequestPermission: this.canRequestPermission()
    };
  }
}

// Make NotificationManager globally available
window.NotificationManager = NotificationManager;
