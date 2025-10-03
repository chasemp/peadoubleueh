/**
 * Theme Manager - Handles light/dark theme switching with system preference detection
 * Based on lessons learned from multiple PWA projects
 */

import logger from './Logger.js';

class ThemeManager {
  constructor() {
    this.storageKey = 'pwa_template_theme';
    this.themes = ['light', 'dark', 'auto'];
    this.currentTheme = 'auto';
    this.systemTheme = 'light';
    
    this.isInitialized = false;
    this.themeChangeCallbacks = [];
    
    // Detect system theme preference
    this.detectSystemTheme();
  }

  async initialize() {
    if (this.isInitialized) return;
    
    logger.log('🎨 Initializing Theme Manager...');
    
    try {
      // Load saved theme preference
      this.loadThemePreference();
      
      // Apply initial theme
      this.applyTheme();
      
      // Listen for system theme changes
      this.setupSystemThemeListener();
      
      this.isInitialized = true;
      logger.log('✅ Theme Manager initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize Theme Manager:', error);
      throw error;
    }
  }

  detectSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.systemTheme = 'dark';
    } else {
      this.systemTheme = 'light';
    }
  }

  setupSystemThemeListener() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      mediaQuery.addEventListener('change', (e) => {
        this.systemTheme = e.matches ? 'dark' : 'light';
        
        // Only update if current theme is 'auto'
        if (this.currentTheme === 'auto') {
          this.applyTheme();
          this.notifyThemeChange();
        }
      });
    }
  }

  loadThemePreference() {
    try {
      const savedTheme = localStorage.getItem(this.storageKey);
      if (savedTheme && this.themes.includes(savedTheme)) {
        this.currentTheme = savedTheme;
      }
    } catch (error) {
      logger.error('Failed to load theme preference:', error);
    }
  }

  saveThemePreference(theme) {
    try {
      localStorage.setItem(this.storageKey, theme);
    } catch (error) {
      logger.error('Failed to save theme preference:', error);
    }
  }

  setTheme(theme) {
    if (!this.themes.includes(theme)) {
      logger.warn(`Invalid theme: ${theme}. Must be one of: ${this.themes.join(', ')}`);
      return false;
    }
    
    this.currentTheme = theme;
    this.saveThemePreference(theme);
    this.applyTheme();
    this.notifyThemeChange();
    
    return true;
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  getEffectiveTheme() {
    if (this.currentTheme === 'auto') {
      return this.systemTheme;
    }
    return this.currentTheme;
  }

  toggleTheme() {
    const effectiveTheme = this.getEffectiveTheme();
    const newTheme = effectiveTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  applyTheme() {
    const effectiveTheme = this.getEffectiveTheme();
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light-theme', 'dark-theme');
    
    // Add new theme class
    root.classList.add(`${effectiveTheme}-theme`);
    
    // Set data attribute for CSS targeting
    root.setAttribute('data-theme', this.currentTheme);
    
    // Update meta theme-color
    this.updateMetaThemeColor(effectiveTheme);
    
    logger.log(`🎨 Applied theme: ${this.currentTheme} (effective: ${effectiveTheme})`);
  }

  updateMetaThemeColor(theme) {
    let themeColor = '#2196F3'; // Default blue
    
    if (theme === 'dark') {
      themeColor = '#1976D2'; // Darker blue for dark theme
    }
    
    // Update existing meta theme-color
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeColor);
    } else {
      // Create new meta theme-color if it doesn't exist
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      metaThemeColor.setAttribute('content', themeColor);
      document.head.appendChild(metaThemeColor);
    }
  }

  // Event System
  onThemeChange(callback) {
    this.themeChangeCallbacks.push(callback);
  }

  notifyThemeChange() {
    const effectiveTheme = this.getEffectiveTheme();
    this.themeChangeCallbacks.forEach(callback => {
      try {
        callback({
          currentTheme: this.currentTheme,
          effectiveTheme: effectiveTheme,
          systemTheme: this.systemTheme
        });
      } catch (error) {
        logger.error('Error in theme change callback:', error);
      }
    });
  }

  // Theme Detection Utilities
  isDarkTheme() {
    return this.getEffectiveTheme() === 'dark';
  }

  isLightTheme() {
    return this.getEffectiveTheme() === 'light';
  }

  isAutoTheme() {
    return this.currentTheme === 'auto';
  }

  // CSS Custom Properties Management
  updateCSSVariables(theme) {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.style.setProperty('--color-background', '#121212');
      root.style.setProperty('--color-surface', '#1e1e1e');
      root.style.setProperty('--color-text', '#ffffff');
      root.style.setProperty('--color-text-secondary', '#b0b0b0');
      root.style.setProperty('--color-border', '#333333');
    } else {
      root.style.setProperty('--color-background', '#ffffff');
      root.style.setProperty('--color-surface', '#f5f5f5');
      root.style.setProperty('--color-text', '#212121');
      root.style.setProperty('--color-text-secondary', '#757575');
      root.style.setProperty('--color-border', '#e0e0e0');
    }
  }

  // Accessibility Support
  updateHighContrastMode() {
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    const root = document.documentElement;
    
    if (prefersHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }

  // Reduced Motion Support
  updateReducedMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = document.documentElement;
    
    if (prefersReducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
  }

  // Theme Persistence Across Sessions
  persistTheme() {
    // This is already handled in setTheme(), but can be called explicitly
    this.saveThemePreference(this.currentTheme);
  }

  // Debug Methods
  getThemeInfo() {
    return {
      currentTheme: this.currentTheme,
      effectiveTheme: this.getEffectiveTheme(),
      systemTheme: this.systemTheme,
      isDark: this.isDarkTheme(),
      isLight: this.isLightTheme(),
      isAuto: this.isAutoTheme()
    };
  }

  // Reset to Default
  resetToDefault() {
    this.setTheme('auto');
  }
}

// Export as ES module
export default ThemeManager;
