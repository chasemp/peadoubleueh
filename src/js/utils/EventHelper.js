/**
 * EventHelper - Universal touch/click event handling
 * Following best practice: "Touch-First Event Handling" - PWA_MOBILE_UX_GUIDE.md
 */

class EventHelper {
  /**
   * Add universal touch/click handler to an element
   * Handles both touch and click events, preventing double-firing
   * 
   * @param {HTMLElement} element - Element to attach handler to
   * @param {Function} handler - Handler function to call
   * @param {Object} options - Optional configuration
   * @param {boolean} options.preventDefault - Whether to prevent default (default: false)
   * @param {boolean} options.stopPropagation - Whether to stop propagation (default: false)
   */
  static addUniversalHandler(element, handler, options = {}) {
    if (!element) {
      console.error('EventHelper: No element provided');
      return;
    }

    let touchHandled = false;
    const { preventDefault = false, stopPropagation = false } = options;

    // Touch event handler
    const touchHandler = (e) => {
      touchHandled = true;
      if (preventDefault) e.preventDefault();
      if (stopPropagation) e.stopPropagation();
      handler(e);
      
      // Reset flag after a short delay
      setTimeout(() => {
        touchHandled = false;
      }, 300);
    };

    // Click event handler
    const clickHandler = (e) => {
      // Skip if already handled by touch
      if (touchHandled) {
        e.preventDefault();
        return;
      }
      if (preventDefault) e.preventDefault();
      if (stopPropagation) e.stopPropagation();
      handler(e);
    };

    // Add both event listeners
    element.addEventListener('touchstart', touchHandler, { passive: !preventDefault });
    element.addEventListener('click', clickHandler);

    // Return cleanup function
    return () => {
      element.removeEventListener('touchstart', touchHandler);
      element.removeEventListener('click', clickHandler);
    };
  }

  /**
   * Add universal handlers to multiple elements
   * 
   * @param {NodeList|Array} elements - Elements to attach handlers to
   * @param {Function} handler - Handler function to call
   * @param {Object} options - Optional configuration
   */
  static addUniversalHandlers(elements, handler, options = {}) {
    const cleanupFunctions = [];
    
    elements.forEach(element => {
      const cleanup = EventHelper.addUniversalHandler(element, handler, options);
      if (cleanup) {
        cleanupFunctions.push(cleanup);
      }
    });

    // Return cleanup function that removes all handlers
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }

  /**
   * Create a delegated universal event handler
   * Useful for dynamically added elements
   * 
   * @param {HTMLElement} container - Container element to attach handler to
   * @param {string} selector - CSS selector for target elements
   * @param {Function} handler - Handler function to call
   * @param {Object} options - Optional configuration
   */
  static addDelegatedHandler(container, selector, handler, options = {}) {
    if (!container) {
      console.error('EventHelper: No container provided');
      return;
    }

    let touchHandled = false;
    const { preventDefault = false, stopPropagation = false } = options;

    const delegatedHandler = (eventType) => (e) => {
      const target = e.target.closest(selector);
      if (!target) return;

      if (eventType === 'touchstart') {
        touchHandled = true;
        if (preventDefault) e.preventDefault();
        if (stopPropagation) e.stopPropagation();
        handler.call(target, e);
        
        setTimeout(() => {
          touchHandled = false;
        }, 300);
      } else if (eventType === 'click') {
        if (touchHandled) {
          e.preventDefault();
          return;
        }
        if (preventDefault) e.preventDefault();
        if (stopPropagation) e.stopPropagation();
        handler.call(target, e);
      }
    };

    const touchHandler = delegatedHandler('touchstart');
    const clickHandler = delegatedHandler('click');

    container.addEventListener('touchstart', touchHandler, { passive: !preventDefault });
    container.addEventListener('click', clickHandler);

    // Return cleanup function
    return () => {
      container.removeEventListener('touchstart', touchHandler);
      container.removeEventListener('click', clickHandler);
    };
  }
}

export default EventHelper;

