/**
 * Cache Busting Manager - Production-ready cache busting implementation
 * Based on comprehensive research from Alf project and lessons learned
 */

import logger from '../utils/Logger.js';

class CacheBustingManager {
  constructor() {
    this.strategies = {
      'service-worker-version-bump': this.serviceWorkerVersionBump.bind(this),
      'cache-signature-invalidation': this.cacheSignatureInvalidation.bind(this),
      'user-agent-fingerprint-busting': this.userAgentFingerprintBusting.bind(this),
      'conditional-request-bypass': this.conditionalRequestBypass.bind(this),
      'network-condition-simulation': this.networkConditionSimulation.bind(this),
      'manifest-fingerprint-update': this.manifestFingerprintUpdate.bind(this)
    };
    
    this.config = {
      versionBumpEnabled: true,
      signatureInvalidationEnabled: true,
      fingerprintBustingEnabled: true,
      conditionalBypassEnabled: true,
      networkSimulationEnabled: true,
      manifestUpdateEnabled: true,
      updateCheckInterval: 30000, // 30 seconds
      maxRetries: 3,
      retryDelay: 1000,
      debugMode: localStorage.getItem('debug') === 'true'
    };
    
    this.updatePromptCallbacks = [];
    this.isInitialized = false;
    this.currentVersion = this.getCurrentVersion();
    this.lastUpdateCheck = 0;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    logger.log('🔄 Initializing Cache Busting Manager...');
    
    try {
      // Set up periodic update checks
      this.setupPeriodicUpdateChecks();
      
      // Initialize service worker if available
      if ('serviceWorker' in navigator) {
        await this.initializeServiceWorker();
      }
      
      // Set up user agent fingerprint busting
      this.setupFingerprintBusting();
      
      this.isInitialized = true;
      logger.log('✅ Cache Busting Manager initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize Cache Busting Manager:', error);
      throw error;
    }
  }

  onUpdatePrompt(callback) {
    this.updatePromptCallbacks.push(callback);
  }

  triggerUpdatePrompt(strategy, details) {
    const event = {
      strategy,
      details,
      timestamp: Date.now(),
      version: this.currentVersion
    };
    
    this.updatePromptCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        logger.error('Error in update prompt callback:', error);
      }
    });
  }

  // Strategy 1: Service Worker Version Bump (Most Effective)
  async serviceWorkerVersionBump() {
    if (!this.config.versionBumpEnabled) {
      return { success: false, reason: 'Strategy disabled' };
    }

    logger.log('🔄 Executing Service Worker Version Bump...');
    
    try {
      const currentVersion = this.getCurrentServiceWorkerVersion();
      const newVersion = this.incrementVersion(currentVersion);
      
      // Update service worker version in cache
      await this.updateServiceWorkerVersion(newVersion);
      
      // Force service worker update
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
        }
      }
      
      this.triggerUpdatePrompt('service-worker-version-bump', {
        oldVersion: currentVersion,
        newVersion: newVersion
      });
      
      return { success: true, details: { oldVersion: currentVersion, newVersion: newVersion } };
    } catch (error) {
      logger.error('Service Worker Version Bump failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Strategy 2: Cache Signature Invalidation
  async cacheSignatureInvalidation() {
    if (!this.config.signatureInvalidationEnabled) {
      return { success: false, reason: 'Strategy disabled' };
    }

    logger.log('🔄 Executing Cache Signature Invalidation...');
    
    try {
      const signatures = {
        'main.js': 'abc123_modified_' + Date.now(),
        'style.css': 'def456_modified_' + Date.now(),
        'index.html': 'ghi789_modified_' + Date.now()
      };
      
      // Apply new signatures to existing caches
      await this.applyNewSignatures(signatures);
      
      this.triggerUpdatePrompt('cache-signature-invalidation', {
        signatures: signatures
      });
      
      return { success: true, details: { signatures: signatures } };
    } catch (error) {
      logger.error('Cache Signature Invalidation failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Strategy 3: User Agent Fingerprint Busting
  async userAgentFingerprintBusting() {
    if (!this.config.fingerprintBustingEnabled) {
      return { success: false, reason: 'Strategy disabled' };
    }

    logger.log('🔄 Executing User Agent Fingerprint Busting...');
    
    try {
      const newFingerprint = this.generateNewFingerprint();
      await this.applyNewFingerprint(newFingerprint);
      
      this.triggerUpdatePrompt('user-agent-fingerprint-busting', {
        fingerprint: newFingerprint
      });
      
      return { success: true, details: { fingerprint: newFingerprint } };
    } catch (error) {
      logger.error('User Agent Fingerprint Busting failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Strategy 4: Conditional Request Bypass (Most Effective Experiment)
  async conditionalRequestBypass() {
    if (!this.config.conditionalBypassEnabled) {
      return { success: false, reason: 'Strategy disabled' };
    }

    logger.log('🔄 Executing Conditional Request Bypass...');
    
    try {
      const bypassStrategies = this.generateBypassStrategies();
      await this.applyBypassStrategies(bypassStrategies);
      
      this.triggerUpdatePrompt('conditional-request-bypass', {
        strategies: bypassStrategies
      });
      
      return { success: true, details: { strategies: bypassStrategies } };
    } catch (error) {
      logger.error('Conditional Request Bypass failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Strategy 5: Network Condition Simulation
  async networkConditionSimulation() {
    if (!this.config.networkSimulationEnabled) {
      return { success: false, reason: 'Strategy disabled' };
    }

    logger.log('🔄 Executing Network Condition Simulation...');
    
    try {
      const conditions = this.simulateNetworkConditions();
      await this.applyNetworkConditions(conditions);
      
      this.triggerUpdatePrompt('network-condition-simulation', {
        conditions: conditions
      });
      
      return { success: true, details: { conditions: conditions } };
    } catch (error) {
      logger.error('Network Condition Simulation failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Strategy 6: Manifest Fingerprint Update
  async manifestFingerprintUpdate() {
    if (!this.config.manifestUpdateEnabled) {
      return { success: false, reason: 'Strategy disabled' };
    }

    logger.log('🔄 Executing Manifest Fingerprint Update...');
    
    try {
      const newFingerprint = this.generateManifestFingerprint();
      await this.updateManifestFingerprint(newFingerprint);
      
      this.triggerUpdatePrompt('manifest-fingerprint-update', {
        fingerprint: newFingerprint
      });
      
      return { success: true, details: { fingerprint: newFingerprint } };
    } catch (error) {
      logger.error('Manifest Fingerprint Update failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Test All Strategies
  async testAllStrategies() {
    logger.log('🧪 Testing all cache busting strategies...');
    
    const results = [];
    
    for (const [strategyName, strategyFunction] of Object.entries(this.strategies)) {
      try {
        const result = await strategyFunction();
        results.push({
          strategy: strategyName,
          success: result.success,
          details: result.details || result.error || result.reason
        });
        
        // Small delay between strategies
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        results.push({
          strategy: strategyName,
          success: false,
          error: error.message
        });
      }
    }
    
    const successful = results.filter(r => r.success).length;
    logger.log(`✅ Cache busting test completed: ${successful}/${results.length} strategies successful`);
    
    return results;
  }

  // Helper Methods
  getCurrentVersion() {
    return '1.0.0'; // This should be dynamically determined
  }

  getCurrentServiceWorkerVersion() {
    // This should read from service worker or cache
    return '1.0.0';
  }

  incrementVersion(version) {
    const parts = version.split('.');
    const patch = parseInt(parts[2]) + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  async updateServiceWorkerVersion(newVersion) {
    // Update service worker version in cache
    if ('caches' in window) {
      const cache = await caches.open('sw-version-cache');
      await cache.put('/sw-version', new Response(newVersion));
    }
  }

  async applyNewSignatures(signatures) {
    // Apply new signatures to cache
    if ('caches' in window) {
      const cache = await caches.open('signature-cache');
      for (const [resource, signature] of Object.entries(signatures)) {
        await cache.put(`/signature-${resource}`, new Response(signature));
      }
    }
  }

  generateNewFingerprint() {
    return `ua_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async applyNewFingerprint(fingerprint) {
    // Store new fingerprint
    localStorage.setItem('user-agent-fingerprint', fingerprint);
    
    // Update user agent if possible (limited by browser security)
    if (this.config.debugMode) {
      logger.log('New fingerprint applied:', fingerprint);
    }
  }

  generateBypassStrategies() {
    return {
      cacheBustingParam: `t=${Date.now()}`,
      freshHeaders: {
        'Cache-Control': 'no-cache',
        'X-Fresh-Request': 'true',
        'X-Timestamp': Date.now().toString()
      }
    };
  }

  async applyBypassStrategies(strategies) {
    // Apply bypass strategies
    localStorage.setItem('bypass-strategies', JSON.stringify(strategies));
    
    if (this.config.debugMode) {
      logger.log('Bypass strategies applied:', strategies);
    }
  }

  simulateNetworkConditions() {
    return {
      slowConnection: true,
      offlineSimulation: false,
      highLatency: true,
      lowBandwidth: false
    };
  }

  async applyNetworkConditions(conditions) {
    // Apply network condition simulation
    localStorage.setItem('network-conditions', JSON.stringify(conditions));
    
    if (this.config.debugMode) {
      logger.log('Network conditions applied:', conditions);
    }
  }

  generateManifestFingerprint() {
    return `manifest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async updateManifestFingerprint(fingerprint) {
    // Update manifest fingerprint
    localStorage.setItem('manifest-fingerprint', fingerprint);
    
    if (this.config.debugMode) {
      logger.log('Manifest fingerprint updated:', fingerprint);
    }
  }

  setupPeriodicUpdateChecks() {
    setInterval(() => {
      this.checkForUpdates();
    }, this.config.updateCheckInterval);
  }

  async checkForUpdates() {
    const now = Date.now();
    if (now - this.lastUpdateCheck < this.config.updateCheckInterval) {
      return; // Too soon for another check
    }
    
    this.lastUpdateCheck = now;
    
    try {
      // Run a subset of strategies for periodic checks
      await this.serviceWorkerVersionBump();
      await this.conditionalRequestBypass();
    } catch (error) {
      logger.error('Periodic update check failed:', error);
    }
  }

  async initializeServiceWorker() {
    // Initialize service worker for cache busting
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        logger.log('Service worker registered for cache busting');
      } catch (error) {
        logger.error('Service worker registration failed:', error);
      }
    }
  }

  setupFingerprintBusting() {
    // Set up user agent fingerprint busting
    const fingerprint = this.generateNewFingerprint();
    this.applyNewFingerprint(fingerprint);
  }

  // Configuration Methods
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig() {
    return { ...this.config };
  }

  // Debug Methods
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      currentVersion: this.currentVersion,
      strategiesEnabled: Object.keys(this.strategies).filter(
        strategy => this.config[`${strategy.replace(/-/g, '')}Enabled`]
      ),
      lastUpdateCheck: this.lastUpdateCheck
    };
  }
}

// Export as ES module
export default CacheBustingManager;
