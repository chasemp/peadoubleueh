# PWA Quick Reference

*Essential patterns, code snippets, and troubleshooting guide for rapid PWA development*

---

## 📋 Table of Contents

1. [Essential Code Patterns](#essential-code-patterns)
2. [Quick Troubleshooting](#quick-troubleshooting)
3. [Mobile Touch Events](#mobile-touch-events)
4. [PWA Setup Checklist](#pwa-setup-checklist)
5. [Deployment Quick Reference](#deployment-quick-reference)
6. [Common Mistakes](#common-mistakes)
7. [Key Takeaways](#key-takeaways)

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

### **Local Testing Environment**
- [ ] Use Chrome Beta for PWA testing (keeps main browser clean)
- [ ] Configure MCP Playwright with Chrome Beta path
- [ ] Test fresh install by clearing all Chrome Beta data
- [ ] Verify service worker registration from clean state

**Chrome Beta Setup:**
```bash
# Install Chrome Beta, then configure MCP:
# .cursor/mcp.json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--browser", 
               "/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome Beta"]
    }
  }
}
```

**Full guide:** [Development Workflow - Local Testing Environment](/project-docs/PWA_DEVELOPMENT_WORKFLOW.md#local-testing-environment-setup)

---

## 🚀 Deployment Quick Reference

### The /src → /docs Pattern (MANDATORY)

**The #1 rule:** Never mix source and built files.

```
your-pwa/
├── src/      # ✅ Edit here
├── public/   # Static assets  
├── docs/     # 🤖 Auto-generated
```

### Daily Workflow

```bash
vim src/index.html            # 1. Edit source
npm run dev                   # 2. Test locally
git commit -m "Feature"       # 3. Commit (auto-builds)
git push                      # 4. Deploy (live in ~2 min)
```

### Essential Config

**vite.config.js:**
```javascript
export default {
  root: 'src',
  publicDir: '../public',
  build: { outDir: '../docs', emptyOutDir: true },
  server: { port: 3456 }
}
```

**Pre-commit hook:**
```bash
#!/bin/bash
set -e
npm test
npm run build --silent
cp build docs/build
cp build-info.json docs/build-info.json
git add docs/
```

**.gitignore:**
```
/build
/build-info.json
```

### Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Working directory not clean | Ensure `/build`, `/build-info.json` in `.gitignore` |
| Live site doesn't match code | Run `npm run build`, commit `/docs`, push |
| Pre-commit hook fails | Run `npm run build` to see detailed errors |
| Git permission errors | Run `chmod -R u+w docs/` (never use read-only) |

### Setup Checklist

- [ ] `.gitattributes` marks `/docs` as generated
- [ ] `.cursorrules` warns AI about `/docs`
- [ ] `.gitignore` excludes root build artifacts
- [ ] Pre-commit hook automates build
- [ ] GitHub Pages: Branch `main`, Folder `/docs`

### Success Criteria

✅ Developers only edit `/src`  
✅ `git status` clean after commits  
✅ Live site updates within 2 minutes  
✅ No confusion about "which file is latest"

---

**📚 Complete Guide:** [DEPLOYMENT_ARCHITECTURE.md](/project-docs/DEPLOYMENT_ARCHITECTURE.md) for full setup, protection layers, build metadata strategy, troubleshooting, and migration guide.

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
- ❌ **Mixing source and built files** - THE most destructive mistake (use /src → /docs pattern)

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

### **GitHub Pages Deployment (UPDATED Oct 2025)**
- **Use /src → /docs pattern** - mandatory for all new projects
- **Configure Pages to serve from /docs** - NOT from root or gh-pages branch
- **Pre-commit hook auto-builds** - never forget to build
- **Gitignore root build artifacts** - only commit /docs versions
- **No GitHub Actions needed** - Pages serves /docs directly
- **Use relative paths for all assets** - absolute paths break on GitHub Pages
- **See:** [DEPLOYMENT_ARCHITECTURE.md](/project-docs/DEPLOYMENT_ARCHITECTURE.md) for complete guide

### **Demo Data Generation**
- **Use platform to generate demo data** - Never create separate demo data scripts
- **Export from production platform** - Use actual platform APIs to generate data
- **Anonymize sensitive data** - Remove PII but keep structure intact
- **Cache demo data locally** - For offline functionality
- **Refresh from platform** - Keep demo data current with platform changes
- **Avoid synthetic generators** - They diverge from real platform behavior

---

## 🔗 Related Guides

- **[PWA Mobile UX Guide](/project-docs/PWA_MOBILE_UX_GUIDE.md)** - Detailed mobile design patterns
- **[PWA Technical Implementation](/project-docs/PWA_TECHNICAL_IMPLEMENTATION.md)** - Architecture and technical patterns
- **[PWA Development Workflow](/project-docs/PWA_DEVELOPMENT_WORKFLOW.md)** - Testing and development processes

---

*This quick reference provides essential patterns for rapid PWA development. For detailed explanations and context, refer to the specialized guides linked above.*
