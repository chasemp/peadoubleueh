/**
 * Storage Manager - Handles all data persistence with migration support
 * Based on lessons learned from multiple PWA projects
 */

class StorageManager {
  constructor() {
    this.storageKey = 'pwa_template_data';
    this.settingsKey = 'pwa_template_settings';
    this.versionKey = 'pwa_template_version';
    this.currentVersion = '1.0.0';
    
    this.defaultSettings = {
      theme: 'auto',
      notifications: true,
      autoUpdate: true,
      language: 'en',
      debugMode: false
    };
    
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    console.log('🗄️ Initializing Storage Manager...');
    
    try {
      // Check for data migration
      await this.checkForMigration();
      
      // Initialize default settings if not exist
      if (!this.getSettings()) {
        this.setSettings(this.defaultSettings);
      }
      
      this.isInitialized = true;
      console.log('✅ Storage Manager initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Storage Manager:', error);
      throw error;
    }
  }

  // Settings Management
  getSettings() {
    try {
      const settings = localStorage.getItem(this.settingsKey);
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('Failed to get settings:', error);
      return null;
    }
  }

  setSettings(settings) {
    try {
      const currentSettings = this.getSettings() || {};
      const mergedSettings = { ...currentSettings, ...settings };
      localStorage.setItem(this.settingsKey, JSON.stringify(mergedSettings));
      return true;
    } catch (error) {
      console.error('Failed to set settings:', error);
      return false;
    }
  }

  updateSettings(updates) {
    const currentSettings = this.getSettings() || this.defaultSettings;
    return this.setSettings({ ...currentSettings, ...updates });
  }

  // Generic Storage Methods
  getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Failed to get item ${key}:`, error);
      return defaultValue;
    }
  }

  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Failed to set item ${key}:`, error);
      return false;
    }
  }

  removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove item ${key}:`, error);
      return false;
    }
  }

  // Data Management
  getData() {
    return this.getItem(this.storageKey, {});
  }

  setData(data) {
    return this.setItem(this.storageKey, data);
  }

  updateData(updates) {
    const currentData = this.getData();
    return this.setData({ ...currentData, ...updates });
  }

  clearData() {
    return this.removeItem(this.storageKey);
  }

  // Migration Support
  async checkForMigration() {
    const storedVersion = localStorage.getItem(this.versionKey);
    
    if (!storedVersion) {
      // First time setup
      localStorage.setItem(this.versionKey, this.currentVersion);
      return;
    }
    
    if (storedVersion !== this.currentVersion) {
      console.log(`🔄 Migrating data from version ${storedVersion} to ${this.currentVersion}`);
      await this.migrateData(storedVersion, this.currentVersion);
      localStorage.setItem(this.versionKey, this.currentVersion);
    }
  }

  async migrateData(fromVersion, toVersion) {
    // Version-specific migration logic
    const migrations = {
      '1.0.0': () => this.migrateToV1_0_0(),
      // Add more migrations as needed
    };
    
    try {
      // Run migrations in sequence
      const versionNumbers = this.getVersionNumbers(fromVersion, toVersion);
      
      for (const version of versionNumbers) {
        const migration = migrations[version];
        if (migration) {
          console.log(`Running migration for version ${version}`);
          await migration();
        }
      }
      
      console.log('✅ Data migration completed successfully');
    } catch (error) {
      console.error('❌ Data migration failed:', error);
      // Don't throw - allow app to continue with potentially incomplete data
    }
  }

  getVersionNumbers(fromVersion, toVersion) {
    // Simple version comparison - can be enhanced for complex versioning
    const versions = ['1.0.0']; // Add all versions in order
    const fromIndex = versions.indexOf(fromVersion);
    const toIndex = versions.indexOf(toVersion);
    
    if (fromIndex === -1 || toIndex === -1) {
      console.warn('Unknown version in migration');
      return [];
    }
    
    return versions.slice(fromIndex + 1, toIndex + 1);
  }

  migrateToV1_0_0() {
    // Example migration logic
    console.log('Running migration to v1.0.0');
    
    // Migrate old settings format if needed
    const oldSettings = localStorage.getItem('old_settings_key');
    if (oldSettings) {
      try {
        const parsed = JSON.parse(oldSettings);
        // Transform old format to new format
        const newSettings = {
          theme: parsed.theme || 'auto',
          notifications: parsed.notifications !== false,
          autoUpdate: parsed.autoUpdate !== false
        };
        this.setSettings(newSettings);
        localStorage.removeItem('old_settings_key');
      } catch (error) {
        console.error('Failed to migrate old settings:', error);
      }
    }
  }

  // Storage Quota Management
  getStorageUsage() {
    try {
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length;
        }
      }
      return totalSize;
    } catch (error) {
      console.error('Failed to calculate storage usage:', error);
      return 0;
    }
  }

  getStorageQuota() {
    // Estimate available storage (not all browsers support navigator.storage.estimate)
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        return navigator.storage.estimate();
      }
      return null;
    } catch (error) {
      console.error('Failed to get storage quota:', error);
      return null;
    }
  }

  async cleanupOldData() {
    try {
      const data = this.getData();
      const now = Date.now();
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      
      // Remove old data
      const cleanedData = {};
      for (const [key, value] of Object.entries(data)) {
        if (value.timestamp && (now - value.timestamp) < maxAge) {
          cleanedData[key] = value;
        }
      }
      
      this.setData(cleanedData);
      console.log('✅ Old data cleaned up');
    } catch (error) {
      console.error('Failed to cleanup old data:', error);
    }
  }

  // Export/Import
  exportData() {
    try {
      const data = {
        settings: this.getSettings(),
        data: this.getData(),
        version: this.currentVersion,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `pwa-template-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Failed to export data:', error);
      return false;
    }
  }

  async importData(file) {
    try {
      const text = await file.text();
      const importedData = JSON.parse(text);
      
      // Validate imported data
      if (!importedData.version || !importedData.settings) {
        throw new Error('Invalid backup file format');
      }
      
      // Import settings
      if (importedData.settings) {
        this.setSettings(importedData.settings);
      }
      
      // Import data
      if (importedData.data) {
        this.setData(importedData.data);
      }
      
      console.log('✅ Data imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // Debug Methods
  getAllKeys() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      keys.push(localStorage.key(i));
    }
    return keys;
  }

  clearAll() {
    try {
      localStorage.clear();
      console.log('✅ All storage cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear all storage:', error);
      return false;
    }
  }
}

// Make StorageManager globally available
window.StorageManager = StorageManager;
