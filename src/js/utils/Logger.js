/**
 * Logger Utility - Conditional logging for production vs development
 * Following best practice: "Remove all debug code" - PWA_DEVELOPMENT_WORKFLOW.md
 */

class Logger {
  constructor() {
    // Check if we're in development mode
    this.isDev = import.meta.env.DEV || 
                 import.meta.env.MODE === 'development' ||
                 localStorage.getItem('debug') === 'true' ||
                 window.location.hostname === 'localhost' ||
                 window.location.hostname.includes('127.0.0.1');
  }

  /**
   * Log informational message (only in development)
   * @param {...any} args - Arguments to log
   */
  log(...args) {
    if (this.isDev) {
      console.log(...args);
    }
  }

  /**
   * Log warning (only in development)
   * @param {...any} args - Arguments to log
   */
  warn(...args) {
    if (this.isDev) {
      console.warn(...args);
    }
  }

  /**
   * Log error (always logged, even in production)
   * Errors should always be visible for debugging
   * @param {...any} args - Arguments to log
   */
  error(...args) {
    console.error(...args);
  }

  /**
   * Log informational message with emoji prefix
   * @param {string} emoji - Emoji to prefix
   * @param {...any} args - Arguments to log
   */
  info(emoji, ...args) {
    if (this.isDev) {
      console.log(emoji, ...args);
    }
  }

  /**
   * Log success message (only in development)
   * @param {...any} args - Arguments to log
   */
  success(...args) {
    if (this.isDev) {
      console.log('✅', ...args);
    }
  }

  /**
   * Log warning with emoji (only in development)
   * @param {...any} args - Arguments to log
   */
  warning(...args) {
    if (this.isDev) {
      console.warn('⚠️', ...args);
    }
  }

  /**
   * Enable debug mode programmatically
   */
  enableDebug() {
    localStorage.setItem('debug', 'true');
    this.isDev = true;
    this.log('🐛 Debug mode enabled');
  }

  /**
   * Disable debug mode
   */
  disableDebug() {
    localStorage.removeItem('debug');
    this.isDev = false;
  }
}

// Export singleton instance
const logger = new Logger();
export default logger;

