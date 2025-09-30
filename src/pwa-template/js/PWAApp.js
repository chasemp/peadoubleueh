/**
 * PWA Template - Main Application
 * Integrates all best practices learned from multiple PWA projects
 */

class PWAApp {
  constructor() {
    this.isInitialized = false;
    this.storageManager = new StorageManager();
    this.themeManager = new ThemeManager();
    this.notificationManager = new NotificationManager();
    this.performanceMonitor = new PerformanceMonitor();
    this.cacheBustingManager = new CacheBustingManager();
    this.serviceWorkerManager = new ServiceWorkerManager();
    
    // Configuration
    this.config = {
      autoUpdateCheck: true,
      updateCheckInterval: 30000, // 30 seconds
      enableNotifications: true,
      enableAnalytics: true,
      debugMode: localStorage.getItem('debug') === 'true'
    };
    
    this.init();
  }

  async init() {
    if (this.isInitialized) return;
    
    console.log('🚀 Initializing PWA Template...');
    
    try {
      // Initialize all managers
      await this.initializeManagers();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Set up periodic tasks
      this.setupPeriodicTasks();
      
      // Initialize UI
      this.initializeUI();
      
      // Show content after initialization
      this.showContent();
      
      this.isInitialized = true;
      console.log('✅ PWA Template initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize PWA Template:', error);
      this.handleInitializationError(error);
    }
  }

  async initializeManagers() {
    // Initialize storage manager first
    await this.storageManager.initialize();
    
    // Initialize theme manager
    await this.themeManager.initialize();
    
    // Initialize notification manager
    if (this.config.enableNotifications) {
      await this.notificationManager.initialize();
    }
    
    // Initialize performance monitor
    this.performanceMonitor.start();
    
    // Initialize cache busting manager
    await this.cacheBustingManager.initialize();
    
    // Initialize service worker manager
    await this.serviceWorkerManager.initialize();
  }

  setupEventListeners() {
    // Theme toggle
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      this.themeManager.toggleTheme();
    });
    
    // Settings modal
    document.getElementById('settings-btn')?.addEventListener('click', () => {
      this.showSettingsModal();
    });
    
    document.getElementById('close-settings')?.addEventListener('click', () => {
      this.hideSettingsModal();
    });
    
    // Install prompt
    document.getElementById('install-btn')?.addEventListener('click', () => {
      this.handleInstallPrompt();
    });
    
    document.getElementById('dismiss-install')?.addEventListener('click', () => {
      this.hideInstallPrompt();
    });
    
    // Update prompt
    document.getElementById('update-btn')?.addEventListener('click', () => {
      this.handleUpdatePrompt();
    });
    
    document.getElementById('dismiss-update')?.addEventListener('click', () => {
      this.hideUpdatePrompt();
    });
    
    // Demo buttons
    document.getElementById('test-cache-busting')?.addEventListener('click', () => {
      this.testCacheBusting();
    });
    
    document.getElementById('test-offline')?.addEventListener('click', () => {
      this.testOfflineMode();
    });
    
    document.getElementById('test-notifications')?.addEventListener('click', () => {
      this.testNotifications();
    });
    
    // Settings form
    document.getElementById('theme-select')?.addEventListener('change', (e) => {
      this.themeManager.setTheme(e.target.value);
    });
    
    document.getElementById('notifications-toggle')?.addEventListener('change', (e) => {
      this.updateNotificationSettings(e.target.checked);
    });
    
    document.getElementById('auto-update-toggle')?.addEventListener('change', (e) => {
      this.updateAutoUpdateSettings(e.target.checked);
    });
    
    // Service worker events
    this.serviceWorkerManager.onUpdate(() => {
      this.showUpdatePrompt();
    });
    
    // Cache busting events
    this.cacheBustingManager.onUpdatePrompt((event) => {
      this.handleCacheBustingUpdate(event);
    });
    
    // Performance monitoring
    this.performanceMonitor.onMetricsUpdate((metrics) => {
      this.updatePerformanceMetrics(metrics);
    });
    
    // Visibility change (for performance optimization)
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });
    
    // Online/offline events
    window.addEventListener('online', () => {
      this.handleOnlineStatusChange(true);
    });
    
    window.addEventListener('offline', () => {
      this.handleOnlineStatusChange(false);
    });
  }

  setupPeriodicTasks() {
    if (this.config.autoUpdateCheck) {
      setInterval(() => {
        this.checkForUpdates();
      }, this.config.updateCheckInterval);
    }
  }

  initializeUI() {
    try {
      // Set initial theme
      this.themeManager.applyTheme();
      
      // Update theme toggle button
      this.updateThemeToggleButton();
      
      // Load settings
      this.loadSettings();
      
      // Check for install prompt
      this.checkInstallPrompt();
    } catch (error) {
      console.error('Failed to initialize UI:', error);
      throw error; // Fail fast - don't retry
    }
  }

  showContent() {
    // Hide loading state
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = 'none';
    }
    
    // Show main content
    const content = document.getElementById('content');
    if (content) {
      content.style.display = 'block';
    }
  }

  // Theme Management
  updateThemeToggleButton() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) {
      throw new Error('Theme toggle button not found - check HTML structure');
    }
    
    const currentTheme = this.themeManager.getCurrentTheme();
    themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
  }

  // Settings Modal
  showSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
      modal.style.display = 'flex';
      this.loadSettings();
    }
  }

  hideSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  loadSettings() {
    const settings = this.storageManager.getSettings();
    
    // Update theme select
    const themeSelect = document.getElementById('theme-select');
    if (!themeSelect) {
      throw new Error('Theme select element not found - check HTML structure');
    }
    themeSelect.value = settings.theme || 'auto';
    
    // Update notification toggle
    const notificationsToggle = document.getElementById('notifications-toggle');
    if (!notificationsToggle) {
      throw new Error('Notifications toggle element not found - check HTML structure');
    }
    notificationsToggle.checked = settings.notifications !== false;
    
    // Update auto-update toggle
    const autoUpdateToggle = document.getElementById('auto-update-toggle');
    if (!autoUpdateToggle) {
      throw new Error('Auto-update toggle element not found - check HTML structure');
    }
    autoUpdateToggle.checked = settings.autoUpdate !== false;
  }

  updateNotificationSettings(enabled) {
    this.storageManager.updateSettings({ notifications: enabled });
    if (enabled) {
      this.notificationManager.requestPermission();
    }
  }

  updateAutoUpdateSettings(enabled) {
    this.storageManager.updateSettings({ autoUpdate: enabled });
    this.config.autoUpdateCheck = enabled;
  }

  // Install Prompt
  checkInstallPrompt() {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return; // Already installed
    }
    
    // Check if install prompt was dismissed recently
    const dismissed = this.storageManager.getItem('install-prompt-dismissed');
    if (dismissed && Date.now() - dismissed < 7 * 24 * 60 * 60 * 1000) { // 7 days
      return;
    }
    
    // Show install prompt after a delay
    setTimeout(() => {
      this.showInstallPrompt();
    }, 5000);
  }

  showInstallPrompt() {
    const prompt = document.getElementById('install-prompt');
    if (prompt) {
      prompt.style.display = 'block';
    }
  }

  hideInstallPrompt() {
    const prompt = document.getElementById('install-prompt');
    if (prompt) {
      prompt.style.display = 'none';
      // Remember dismissal for 7 days
      this.storageManager.setItem('install-prompt-dismissed', Date.now());
    }
  }

  async handleInstallPrompt() {
    try {
      // This would typically be handled by the service worker manager
      await this.serviceWorkerManager.installApp();
      this.hideInstallPrompt();
    } catch (error) {
      console.error('Failed to install app:', error);
    }
  }

  // Update Prompt
  showUpdatePrompt() {
    const prompt = document.getElementById('update-prompt');
    if (prompt) {
      prompt.style.display = 'block';
    }
  }

  hideUpdatePrompt() {
    const prompt = document.getElementById('update-prompt');
    if (prompt) {
      prompt.style.display = 'none';
    }
  }

  async handleUpdatePrompt() {
    try {
      await this.serviceWorkerManager.updateApp();
      this.hideUpdatePrompt();
    } catch (error) {
      console.error('Failed to update app:', error);
    }
  }

  // Demo Functions
  async testCacheBusting() {
    console.log('🧪 Testing cache busting...');
    try {
      const result = await this.cacheBustingManager.testAllStrategies();
      console.log('Cache busting test results:', result);
      
      if (this.config.enableNotifications) {
        this.notificationManager.show('Cache Busting Test', 'Test completed successfully!');
      }
    } catch (error) {
      console.error('Cache busting test failed:', error);
    }
  }

  async testOfflineMode() {
    console.log('📱 Testing offline mode...');
    
    // Simulate offline mode
    const originalOnline = navigator.onLine;
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    });
    
    // Dispatch offline event
    window.dispatchEvent(new Event('offline'));
    
    // Show offline indicator
    this.showOfflineIndicator();
    
    // Restore online state after 3 seconds
    setTimeout(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: originalOnline
      });
      window.dispatchEvent(new Event('online'));
      this.hideOfflineIndicator();
    }, 3000);
  }

  async testNotifications() {
    console.log('🔔 Testing notifications...');
    try {
      await this.notificationManager.show('Test Notification', 'This is a test notification from the PWA Template!');
    } catch (error) {
      console.error('Notification test failed:', error);
    }
  }

  // Event Handlers
  handleCacheBustingUpdate(event) {
    console.log('🔄 Cache busting update detected:', event);
    
    if (this.config.enableNotifications) {
      this.notificationManager.show('Update Available', 'New content has been detected and will be loaded.');
    }
  }

  handleVisibilityChange() {
    if (document.hidden) {
      // App is hidden - pause non-essential operations
      this.performanceMonitor.pause();
    } else {
      // App is visible - resume operations
      this.performanceMonitor.resume();
      
      // Check for updates when app becomes visible
      if (this.config.autoUpdateCheck) {
        this.checkForUpdates();
      }
    }
  }

  handleOnlineStatusChange(isOnline) {
    if (isOnline) {
      console.log('🌐 App is online');
      this.hideOfflineIndicator();
      
      // Check for updates when coming back online
      if (this.config.autoUpdateCheck) {
        this.checkForUpdates();
      }
    } else {
      console.log('📱 App is offline');
      this.showOfflineIndicator();
    }
  }

  showOfflineIndicator() {
    // Create or show offline indicator
    let indicator = document.getElementById('offline-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'offline-indicator';
      indicator.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #ff9800;
        color: white;
        text-align: center;
        padding: 8px;
        z-index: 1002;
      `;
      indicator.textContent = '📱 You are offline';
      document.body.appendChild(indicator);
    }
    indicator.style.display = 'block';
  }

  hideOfflineIndicator() {
    const indicator = document.getElementById('offline-indicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
  }

  updatePerformanceMetrics(metrics) {
    // Update performance metrics in UI if needed
    if (this.config.debugMode) {
      console.log('Performance metrics:', metrics);
    }
  }

  async checkForUpdates() {
    try {
      await this.serviceWorkerManager.checkForUpdates();
    } catch (error) {
      console.error('Update check failed:', error);
    }
  }

  handleInitializationError(error) {
    console.error('Initialization error:', error);
    
    // Show error message to user
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #f44336;
      color: white;
      padding: 20px;
      border-radius: 8px;
      z-index: 1000;
      text-align: center;
    `;
    errorDiv.innerHTML = `
      <h3>Initialization Error</h3>
      <p>Failed to initialize the app. Please refresh the page.</p>
      <button onclick="location.reload()" style="
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
      ">Refresh Page</button>
    `;
    document.body.appendChild(errorDiv);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.pwaApp = new PWAApp();
});

// Make app globally available for debugging
window.PWAApp = PWAApp;
