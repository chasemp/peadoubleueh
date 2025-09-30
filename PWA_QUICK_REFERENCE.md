# PWA Quick Reference

*Essential patterns, code snippets, and troubleshooting guide for rapid PWA development*

---

## 📋 Table of Contents

1. [Essential Code Patterns](#essential-code-patterns)
2. [Quick Troubleshooting](#quick-troubleshooting)
3. [Mobile Touch Events](#mobile-touch-events)
4. [PWA Setup Checklist](#pwa-setup-checklist)
5. [Common Mistakes](#common-mistakes)
6. [Key Takeaways](#key-takeaways)

---

## 🔧 Essential Code Patterns

### Touch Event Handling (Mobile + Desktop)
```javascript
// ✅ Universal touch/click handler
const handleAction = () => {
    // Your action logic here
    performAction();
};

// Add both events for cross-platform compatibility
element.addEventListener('click', handleAction);  // Desktop
element.addEventListener('touchstart', (e) => {  // Mobile
    e.preventDefault();
    handleAction();
}, { passive: false });
```

### Settings Management (No Data Loss)
```javascript
// ✅ CORRECT: Load from storage FIRST, then set defaults
class SettingsManager {
    constructor() {
        this.settings = this.storage.loadSettings();
        this.currentDifficulty = this.settings.difficulty || 'normal'; // Default only if not found
    }
}

// ❌ WRONG: Hardcoded defaults before loading user data
class SettingsManager {
    constructor() {
        this.currentDifficulty = 'normal'; // Hardcoded!
        this.settings = this.storage.loadSettings(); // Loaded after default
    }
}
```

### Data Migration (Preserve User Data)
```javascript
// ✅ Migrate legacy keys without data loss
this.migrateLegacyKeys = function () {
  try {
    const legacySettings = localStorage.getItem('app-settings');
    const currentSettings = localStorage.getItem('app_settings');
    if (legacySettings && !currentSettings) {
      localStorage.setItem('app_settings', legacySettings);
    }
  } catch {}
};

// Listen for both old and new keys during transition
window.addEventListener('storage', (e) => {
  if (e.key === 'app-settings' || e.key === 'app_settings') {
    reloadSettings();
  }
});
```

### Modal Cleanup (Prevent Touch Blocking)
```javascript
// ✅ Properly remove from DOM, not just hide
hide() {
    this.container.classList.remove('show');
    setTimeout(() => {
        this.container.parentNode.removeChild(this.container);
        this.container = null;
    }, 300);
}

// ❌ WRONG: Only hides visually, DOM element remains
hide() {
    this.container.classList.remove('show'); // Visual only
    // Overlay still blocks clicks!
}
```

### Dynamic Imports (Optional Features)
```javascript
// ✅ Use dynamic imports for optional features
import('/js/pwa/install.js').then(module => {
    // Handle loaded module
});

// ❌ Static imports can break entire modules if path is wrong
import { PWAInstallManager } from '/js/pwa/install.js'; // Wrong path!
```

### Non-Blocking Haptic Feedback
```javascript
// ✅ Async haptic feedback that never blocks navigation
addHapticFeedback() {
    setTimeout(() => {
        if ('vibrate' in navigator) {
            try {
                navigator.vibrate(10);
            } catch (error) {
                // Silently ignore - never block navigation
            }
        }
    }, 0);
}
```

### CSS Timing Fixes (SAMM360 Pattern)
```javascript
// ✅ Multi-layer timing strategy for DOM manipulation
(function() {
    function ensureElementVisible() {
        const element = document.getElementById('target-element');
        if (element) {
            element.style.display = 'block';
            element.style.visibility = 'visible';
            element.style.opacity = '1';
        } else {
            setTimeout(ensureElementVisible, 50); // Retry
        }
    }
    
    // Try multiple approaches
    ensureElementVisible(); // Immediate
    document.addEventListener('DOMContentLoaded', ensureElementVisible);
})();
```

### Inline Styles for Critical Visibility
```html
<!-- ✅ Most reliable - bypasses CSS loading order -->
<button style="display: block !important; visibility: visible !important; opacity: 1 !important;">
    Critical Button
</button>
```

### CSS Touch Targets (Mobile-Friendly)
```css
/* ✅ Ensure proper touch targets */
@media (max-width: 768px) {
    button, .nav-item, .theme-option {
        min-height: 44px;
        min-width: 44px;
        touch-action: manipulation;
    }
}
```

### Responsive Canvas Sizing
```css
/* ✅ Mobile-first canvas sizing */
@media (max-width: 768px) {
    .game-board-container {
        width: 280px;
        height: 280px;
        max-width: 90vw;
        max-height: 90vw;
        margin: 0 auto;
    }
}

@media (max-width: 480px) {
    .game-board-container {
        width: 240px;
        height: 240px;
        max-width: 85vw;
        max-height: 85vw;
    }
}
```

---

## 🚨 Quick Troubleshooting

### Touch Events Not Working
- **Check**: Added `touchstart` alongside `click`?
- **Check**: Using `{ passive: false }`?
- **Check**: Calling `preventDefault()`?
- **Check**: Same handler function for both events?

### Settings Reset After Theme Change
- **Check**: Loading from storage before setting defaults?
- **Check**: No hardcoded values overriding user data?
- **Check**: Migration logic for renamed keys?

### Modal Blocks All Touch Interactions
- **Check**: Modal properly removed from DOM?
- **Check**: Not just hidden with CSS?
- **Check**: `setTimeout` for cleanup after animation?

### Canvas Not Rendering
- **Check**: Canvas dimensions (width/height attributes vs CSS)?
- **Check**: Context available (`canvas.getContext('2d')`)?
- **Check**: Canvas in viewport (`getBoundingClientRect()`)?

### Module Loading Fails
- **Check**: Browser console for 404 errors?
- **Check**: File paths correct?
- **Check**: Using dynamic imports for optional features?

### PWA Not Installing
- **Check**: Service worker registered correctly?
- **Check**: Manifest paths are absolute?
- **Check**: No duplicate install buttons?

### Elements Invisible Until Console Opens (CSS Timing)
- **Check**: CSS loading before JavaScript DOM manipulation?
- **Check**: Using inline styles for critical visibility?
- **Check**: JavaScript timing with `setTimeout` delays?
- **Check**: Multiple event listeners (immediate + DOMContentLoaded)?

### CDN Dependencies Failing
- **Check**: External libraries loading from CDN?
- **Check**: Network connectivity issues?
- **Check**: CDN availability in different regions?
- **Solution**: Download libraries locally for reliability

---

## 📱 Mobile Touch Events

### Essential Touch Event Setup
```javascript
// Universal pattern for any interactive element
function addTouchSupport(element, handler) {
    element.addEventListener('click', handler);  // Desktop
    element.addEventListener('touchstart', (e) => {  // Mobile
        e.preventDefault();
        handler();
    }, { passive: false });
}

// Usage
addTouchSupport(button, () => {
    console.log('Button clicked/touched');
});
```

### Elements That Need Touch Support
- ✅ **Buttons** (settings, new game, difficulty, hint)
- ✅ **Interactive cards** (block palette items, difficulty options)
- ✅ **Navigation items** (settings page navigation)
- ✅ **Modal controls** (close buttons, confirmations)
- ✅ **Canvas interactions** (already handled separately)

### CSS Touch Optimizations
```css
/* Prevent text selection and callouts on touch */
.block-item {
    touch-action: manipulation;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
}
```

---

## ✅ PWA Setup Checklist

### **Before Starting**
- [ ] Set up proper file structure (`/src/`, `/public/`)
- [ ] Configure build tools (Vite, Webpack, etc.)
- [ ] Plan mobile-first responsive breakpoints
- [ ] Design touch-friendly interface (44px minimum targets)
- [ ] Choose local libraries over CDN dependencies
- [ ] Set up testing framework with proper isolation

### **During Development**
- [ ] Test on multiple screen sizes (320px, 375px, 414px, 768px)
- [ ] Verify all interactive elements work with touch
- [ ] Check that modals properly clean up from DOM
- [ ] Test both `click` and `touchstart` events
- [ ] Validate responsive breakpoints work as expected
- [ ] Run critical tests before each commit

### **Before Launch**
- [ ] Test on actual mobile devices (iOS Safari, Android Chrome)
- [ ] Verify touch targets are at least 44px
- [ ] Check that pages work better than modals for complex content
- [ ] Test with mobile keyboards (if applicable)
- [ ] Validate native gestures work (swipe back, etc.)
- [ ] Remove all debug code
- [ ] Verify no external dependencies

---

## ❌ Common Mistakes

### Touch Events
- ❌ **Only using `click` events** - won't work on mobile
- ❌ **Using `passive: true`** - prevents custom touch behavior
- ❌ **Different handlers for touch vs click** - creates inconsistent behavior
- ❌ **Forgetting `preventDefault()`** - causes unwanted scrolling/zooming

### State Management
- ❌ **Hardcoding defaults before loading user data** - causes settings to reset
- ❌ **Inconsistent localStorage keys** - causes data loss during upgrades
- ❌ **Not planning data migration** - users lose data when keys change

### PWA Architecture
- ❌ **Using CDN dependencies** - compromises offline capability
- ❌ **Not testing module loading** - silent failures break functionality
- ❌ **Forgetting asset cleanup** - causes repository bloat

### Mobile UX
- ❌ **Using modals for complex content on mobile** - creates interaction blockers
- ❌ **Not testing on real devices** - emulation misses real issues
- ❌ **Touch targets smaller than 44px** - accessibility issues

### Development
- ❌ **Leaving debug code in production** - performance and security issues
- ❌ **Monolithic architecture** - causes merge conflicts and debugging issues
- ❌ **Not using test isolation** - tests interfere with each other

### CSS and Timing
- ❌ **DOM manipulation before CSS loads** - elements invisible until console opens
- ❌ **Single timing approach** - should use immediate + DOMContentLoaded + load events
- ❌ **No retry logic for DOM operations** - elements might not be ready
- ❌ **Relying on external CDNs** - breaks offline capability and reliability

### Static Site Generation
- ❌ **No version tracking in generated files** - hard to debug deployment issues
- ❌ **Mixed development/production outputs** - confusion about which files are current
- ❌ **No incremental generation** - slow builds for large projects

---

## 💡 Key Takeaways

### **Mobile-First Principles**
- **Pages beat modals for complex content** - especially on mobile
- **Touch events are NOT the same as click events** - always add both
- **Space is precious on mobile** - remove obvious text, maximize content area
- **Touch targets must be 44px minimum** - Apple HIG guidelines

### **Technical Implementation**
- **Always use local copies of libraries** - even "cached" CDNs compromise reliability
- **Never hardcode defaults before loading user data** - always load first
- **Use dynamic imports for optional features** - static imports can break modules
- **Make browser API calls non-blocking** - especially for progressive enhancement

### **Development Workflow**
- **Test isolation is critical** - prevent constructor side effects from polluting tests
- **Explicit failure is better than silent fallbacks** - makes debugging easier
- **Use behavioral tests for rapid development** - test user workflows, not implementation
- **Remove debug code before production** - performance and security matter

### **Architecture**
- **Avoid monolithic classes** - use dependency injection and modular design
- **Plan for data migration** - users lose data when storage keys change
- **Test on real devices early and often** - emulation misses real issues
- **Break/fix cycles are usually architectural problems** - fix the architecture

### **Deterministic Programming**
- **Fail fast and explicitly** - don't hide problems with silent fallbacks
- **Prefer deterministic mechanisms** where you control both sides of the interaction
- **Use retry logic judiciously** - only for truly external/unpredictable elements
- **Explicit failure is better than silent fallbacks** - makes debugging easier

### **CSS and Timing (from SAMM360)**
- **Use retry logic judiciously** - only when elements are truly external/unpredictable
- **Prefer deterministic DOM manipulation** - ensure elements exist before manipulating
- **Inline styles for critical visibility** - bypasses CSS loading order issues
- **Test on slow connections** - reveals timing problems that fast connections hide

### **Static Site Generation**
- **Use local copies of all libraries** - CDNs compromise reliability and offline capability
- **Track versions in generated files** - essential for debugging deployment issues
- **Separate development and production outputs** - prevents confusion about current files
- **Use incremental generation** - speeds up builds for large projects

### **GitHub Pages Deployment**
- **Use GitHub Actions + `/docs` directory** - most predictable pattern
- **Keep build artifacts out of git** - use `.gitignore` for `docs/` and `dist/`
- **Use relative paths for all assets** - absolute paths break on GitHub Pages
- **Choose one deployment method** - don't mix branch deployment with GitHub Actions

---

## 🔗 Related Guides

- **[PWA Mobile UX Guide](./PWA_MOBILE_UX_GUIDE.md)** - Detailed mobile design patterns
- **[PWA Technical Implementation](./PWA_TECHNICAL_IMPLEMENTATION.md)** - Architecture and technical patterns
- **[PWA Development Workflow](./PWA_DEVELOPMENT_WORKFLOW.md)** - Testing and development processes

---

*This quick reference provides essential patterns for rapid PWA development. For detailed explanations and context, refer to the specialized guides linked above.*
