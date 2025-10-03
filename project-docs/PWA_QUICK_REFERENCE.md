# PWA Quick Reference

*Essential patterns, code snippets, and troubleshooting guide for rapid PWA development*

---

## 📋 Table of Contents

1. [Essential Code Patterns](#essential-code-patterns)
2. [Theming & Color Palettes](#theming--color-palettes)
3. [Quick Troubleshooting](#quick-troubleshooting)
4. [Mobile Touch Events](#mobile-touch-events)
5. [PWA Setup Checklist](#pwa-setup-checklist)
6. [Deployment Quick Reference](#deployment-quick-reference)
7. [Common Mistakes](#common-mistakes)
8. [Key Takeaways](#key-takeaways)

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

> **💡 Best Practice:** For settings and most UI flows, prefer **page-based navigation** over modals. See [PWA_MOBILE_UX_GUIDE.md](./PWA_MOBILE_UX_GUIDE.md#navigation-patterns) for page-based patterns. Use modals sparingly for critical interruptions only.

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

## 🧪 Testing & Quality Assurance

### Two-Track Testing Strategy

#### Track 1: Behavioral Tests (Fast JS)
```bash
npm run test:behavioral          # CLI runner
npm run test:behavioral:browser  # Browser UI
npm run test:critical           # Pre-commit tests
```

#### Track 2: MCP Playwright (Real Browser)
```bash
npm run test:e2e:execute        # Automated execution
npm run test:mcp:commands       # Generate commands
npm run test:mcp:generate       # Generate test files
```

### Test Structure
```
tests/
├── behavioral/     # Track 1: Fast regression tests
├── playwright/     # Track 2: MCP Playwright automation
├── unit/          # Component isolation tests
├── integration/   # Cross-component tests  
└── characterization/ # Refactoring safety nets
```

### Quick Test Setup

**Behavioral Test Example:**
```javascript
test('Settings: Theme change preserves difficulty (REGRESSION)', async () => {
    const settings = new SettingsManager();
    const difficulty = new DifficultyManager();
    
    settings.setTheme('wood');
    difficulty.setDifficulty('hard');
    settings.setTheme('light');  // Action
    
    assertEqual(difficulty.getCurrentDifficulty(), 'hard');
});
```

**MCP Playwright Command:**
```javascript
{
    name: 'Click Light Theme Button',
    command: 'mcp_playwright_browser_click',
    params: { element: 'Light theme button', ref: '#theme-light' }
}
```

**When to Use Each:**
- **Behavioral**: Regression prevention, fast feedback, component isolation
- **MCP Playwright**: Cross-page workflows, visual verification, mobile interactions

**Full guide:** [Development Workflow - Advanced Testing Patterns](/project-docs/PWA_DEVELOPMENT_WORKFLOW.md#advanced-testing-patterns)

---

## 🔬 Advanced PWA Patterns

### Local-First Architecture
```javascript
// SQLite WebAssembly + File System Access API
async loadSqlJs() {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js';
    // ... initialization
}

async loadDatabaseFromFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    this.db = new SQL.Database(new Uint8Array(arrayBuffer));
}
```

### Web Worker Heavy Processing
```typescript
// ffmpeg.wasm in Web Worker with progress tracking
function useFfmpegWorker() {
    const workerRef = useRef<Worker | null>(null);
    
    const encode = useCallback((opts) => {
        return new Promise((resolve, reject) => {
            const worker = workerRef.current;
            worker.postMessage({ type: 'encode', payload: opts }, [opts.file]);
        });
    }, []);
}
```

### Enhanced Mobile Touch
```typescript
// Advanced touch handling with haptic feedback
function addDualEventListener(element: HTMLElement, handler: () => void) {
    element.addEventListener('touchstart', (e) => {
        e.preventDefault();
        element.style.transform = 'scale(0.95)';
        if (navigator.vibrate) navigator.vibrate(50);
        handler();
    }, { passive: false });
}
```

### Cache Busting Research
```javascript
// Systematic cache strategy testing
class CacheBustingInvestigation {
    async runAllStrategies() {
        const strategies = ['serviceWorkerVersionBump', 'conditionalRequestBypass'];
        for (const strategy of strategies) {
            const result = await this.testStrategy(strategy);
            await this.generateStrategyReport(strategy, result);
        }
    }
}
```

**Full guide:** [Development Workflow - Advanced PWA Patterns](/project-docs/PWA_DEVELOPMENT_WORKFLOW.md#advanced-pwa-patterns-from-production-projects)

---

## 🎨 Theming & Color Palettes

### Choosing Color Palettes

**Use [ColorHunt.co](https://colorhunt.co/)** to discover professional color palettes:
- Search by color, mood, or season
- Find complementary palettes for light & dark modes
- Copy hex codes instantly
- Browse: Nature, Earth, Food themes work well for PWAs

**Pro tip:** Pick two palettes from ColorHunt:
1. **Light mode:** Bright, airy colors (Sage, Pastel, Spring themes)
2. **Dark mode:** Deep, rich colors (Earth, Night themes)

Ensure they share a common color family for cohesion.

---

### Tailwind Color Configuration

**✅ CORRECT: Use semantic color names for easy theme changes**

```javascript
// tailwind.config.js
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Define a flexible primary palette (50-900)
        primary: {
          50: '#E1EEBC',   // Lightest
          100: '#d4e8b0',
          200: '#b8dda0',
          300: '#90C67C',
          400: '#7ab970',
          500: '#67AE6E',  // Main brand color
          600: '#5a9d63',
          700: '#4d8b58',
          800: '#328E6E',
          900: '#2a7459',  // Darkest
        },
        // Optional: Alias for convenience
        sage: {
          DEFAULT: '#67AE6E',
          light: '#90C67C',
          lighter: '#E1EEBC',
          dark: '#328E6E',
        },
        // Dark mode specific colors
        dark: {
          bg: '#432323',       // Main background
          surface: '#2F5755',  // Cards, nav
          accent: '#5A9690',   // Highlights
          text: '#E0D9D9',     // Text color
        }
      }
    },
  },
}
```

**❌ WRONG: Hardcoding color names in HTML**
```html
<!-- DON'T do this -->
<button class="bg-blue-500 hover:bg-blue-600">Click</button>

<!-- DO this instead -->
<button class="bg-primary-500 hover:bg-primary-600">Click</button>
```

---

### Complete Theme Implementation Checklist

When implementing a new color theme, update **all** of these:

#### 1. Tailwind Configuration
```javascript
// tailwind.config.js
colors: {
  primary: { /* your palette */ }
}
```

#### 2. HTML Classes (Use Find & Replace)
```bash
# Replace all color-specific classes with semantic ones
bg-blue-500     → bg-primary-500
text-blue-600   → text-primary-600
border-blue-400 → border-primary-400
hover:bg-blue-  → hover:bg-primary-
focus:ring-blue → focus:ring-primary
```

#### 3. Custom CSS Files
```css
/* src/styles/styles.css */
.btn-primary {
    background-color: #67AE6E; /* Use your primary-500 */
}

.calendar-day.drag-over {
    background-color: rgba(103, 174, 110, 0.1); /* primary with opacity */
    border-color: #67AE6E;
}

/* Dark mode overrides */
.dark .mobile-nav {
    background-color: rgba(47, 87, 85, 0.95); /* dark-surface */
}
```

#### 4. PWA Manifest
```json
{
  "theme_color": "#67AE6E",
  "background_color": "#ffffff"
}
```

#### 5. HTML Meta Tags
```html
<meta name="theme-color" content="#67AE6E">
<meta name="msapplication-TileColor" content="#67AE6E">
```

#### 6. Rebuild CSS
```bash
npm run build:css
```

---

### Dark Mode Color Strategy

**Key principle:** Dark mode needs its own palette, not just inverted colors.

```javascript
// Good dark mode palette strategy
colors: {
  // Light mode uses primary-*
  primary: { 500: '#67AE6E' },  // Sage green
  
  // Dark mode uses dedicated dark-* colors
  dark: {
    bg: '#432323',      // Warm brown (not pure black)
    surface: '#2F5755', // Teal (elevated surfaces)
    accent: '#5A9690',  // Lighter teal (interactive)
    text: '#E0D9D9',    // Off-white (easier on eyes)
  }
}
```

**Apply in CSS:**
```css
/* Light mode - default */
.card {
    background: white;
    color: #1a1a1a;
}

/* Dark mode - dedicated palette */
.dark .card {
    background: #2F5755; /* dark-surface, not just inverted white */
    color: #E0D9D9;      /* dark-text, not pure white */
}
```

---

### Service Worker & Build Tools Pitfall

#### ❌ Caching source paths instead of built assets
```javascript
// BAD: Caching source paths that don't exist after build
const STATIC_ASSETS = [
  '/js/PWAApp.js',        // Doesn't exist after Vite build
  '/css/styles.css',      // Actual file is /assets/main-abc123.css
  '/manifest.json'
];
```

**Problem:** Build tools like Vite add content hashes to filenames. The service worker tries to cache files that don't exist, causing install failure and leaving it in an invalid state.

**Solution:** Only cache non-hashed files in STATIC_ASSETS
```javascript
// GOOD: Only cache files without content hashes
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/build-info.json',
  '/assets/icon-192x192.png',  // Icons don't have hashes
  '/assets/icon-512x512.png'
];

// Hashed JS/CSS are cached dynamically via fetch event
self.addEventListener('fetch', (event) => {
  // Network-first for HTML, cache-first for assets
  // This handles hashed filenames automatically
});
```

**Error Recovery:**
```javascript
// Add recovery for InvalidStateError
try {
  await registration.update();
} catch (error) {
  if (error.name === 'InvalidStateError') {
    // Unregister and re-register
    await navigator.serviceWorker.getRegistrations()
      .then(regs => Promise.all(regs.map(r => r.unregister())));
    await navigator.serviceWorker.register('/sw.js');
  }
}
```

#### Service Worker Development vs Production Strategy

**Critical Lesson**: Different caching strategies prevent development issues

```javascript
// Development vs Production caching strategy
const isDev = () => location.hostname === 'localhost' || location.hostname === '127.0.0.1';

self.addEventListener('fetch', (event) => {
  if (isDev()) {
    // Network-first in development - always get fresh content
    event.respondWith(
      fetch(request)
        .then(response => response)
        .catch(() => caches.match(request))
    );
  } else {
    // Cache-first in production - performance optimized
    event.respondWith(
      caches.match(request)
        .then(response => response || fetch(request))
    );
  }
});
```

#### Service Worker Debugging Checklist

**Essential debugging steps from production experience:**

1. **Always check "Update on reload"** in Chrome DevTools → Application → Service Workers
2. **Manually unregister** during development:
   ```javascript
   // In console
   navigator.serviceWorker.getRegistrations().then(registrations => {
     registrations.forEach(registration => registration.unregister());
   });
   ```
3. **Use network-first strategy** in development mode
4. **Version your caches** to force updates:
   ```javascript
   const CACHE_VERSION = '1.0.1'; // Increment to force refresh
   const CACHE_NAME = `app-cache-${CACHE_VERSION}`;
   ```
5. **Test with cache disabled** during development
6. **Implement fault-tolerant install**:
   ```javascript
   self.addEventListener('install', (event) => {
     event.waitUntil(
       caches.open(CACHE_NAME).then(cache => {
         // Cache each asset individually to prevent total failure
         return Promise.allSettled(
           STATIC_ASSETS.map(url => 
             cache.add(url).catch(err => console.warn(`Failed to cache ${url}`))
           )
         );
       })
     );
   });
   ```

---

### Common Theming Mistakes

#### ❌ Forgetting to rebuild CSS after config changes
```bash
# Always rebuild after changing tailwind.config.js
npm run build:css
```

#### ❌ Using color-specific classes in HTML
```html
<!-- BAD: Hard to change theme later -->
<div class="bg-blue-500 text-white">

<!-- GOOD: Semantic, easy to retheme -->
<div class="bg-primary-500 text-white">
```

#### ❌ Incomplete color replacement
```html
<!-- Missed this one! -->
<div class="bg-primary-500 border-blue-300">
     <!--                  ↑ Still blue! -->
```

**Solution:** Use global find/replace for all variants:
- `bg-blue-`, `text-blue-`, `border-blue-`
- `hover:bg-blue-`, `focus:ring-blue-`
- Check JS files too for dynamic class generation

#### ❌ Not updating custom CSS
```css
/* styles.css still has old colors! */
.btn-primary {
    background: #3b82f6; /* Old blue */
}
```

#### ❌ Dark mode as afterthought
```css
/* BAD: Just inverting colors looks wrong */
.dark body {
    background: #000000; /* Pure black - harsh! */
    color: #ffffff;      /* Pure white - harsh! */
}

/* GOOD: Dedicated dark palette */
.dark body {
    background: #1a1f2e; /* Dark blue-gray */
    color: #e1e4e8;      /* Soft white */
}
```

---

### Quick Theme Testing

**Test both modes immediately:**
```javascript
// Add theme toggle to your dev environment
localStorage.setItem('theme', 'dark');
location.reload();

localStorage.setItem('theme', 'light');
location.reload();
```

**Visual audit checklist:**
- [ ] All buttons use new color
- [ ] Active states (hover, focus) use new color
- [ ] Loading spinners use new color
- [ ] Form inputs (checkboxes, focus rings) use new color
- [ ] Links and accents use new color
- [ ] Dark mode has dedicated palette (not just inverted)
- [ ] Manifest theme_color matches UI
- [ ] Meta tag theme-color matches UI

---

### Real-World Example: MealPlanner Theme

```javascript
// 1. Found palettes on ColorHunt
// Light: Sage greens (#67AE6E, #90C67C, #E1EEBC)
// Dark: Teal + brown (#2F5755, #5A9690, #432323)

// 2. Updated tailwind.config.js
colors: {
  primary: { 500: '#67AE6E', /* ...full scale */ },
  dark: { bg: '#432323', surface: '#2F5755', accent: '#5A9690' }
}

// 3. Find/replace in HTML
// bg-blue-500 → bg-primary-500 (16 replacements)
// text-blue-600 → text-primary-600 (8 replacements)
// etc.

// 4. Updated custom CSS
.btn-primary { background: #67AE6E; }
.dark .calendar { background: #2F5755; }

// 5. Updated manifest + meta tags
"theme_color": "#67AE6E"

// 6. Rebuilt CSS
npm run build:css

// Result: Complete theme change in <10 minutes! 🎉
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

## 🔌 Multi-PWA Port Management

**Problem:** Running multiple PWAs locally causes port conflicts. Dev servers crash and you waste time troubleshooting.

**Solution:** Assign each PWA a unique port and use management tools.

### Port Registry Pattern

```javascript
// Assign unique ports (see PORT_REGISTRY.md)
3456 - pwa-template
3001 - blockdoku
3002 - cannonpop
3003 - bustagroove
3004 - mealplanner
```

### Vite Configuration

```javascript
// vite.config.js
export default defineConfig({
  server: {
    port: 3456,        // ← Unique for THIS project (see PORT_REGISTRY.md)
    host: '0.0.0.0',
    strictPort: true   // ← Fail fast if port is taken
  }
})
```

### Quick Commands

```bash
# Check your project's port
npm run port               # → "This project runs on port 3456"

# Check if port is free
npm run port:check         # → Port status

# Kill your project's port
npm run port:kill          # → Frees port 3456

# Force restart (kill + start)
npm run port:force         # → Kill and restart

# Check all PWA ports
npm run ports              # → Status of all registered ports

# Kill specific port
npm run ports:kill 3001    # → Kills port 3001
```

### Troubleshooting

| Problem | Solution |
|---------|----------|
| Port already in use | `npm run port:kill` or `npm run port:force` |
| Can't remember port | `npm run port` |
| Check what's running | `npm run ports` |
| Kill wrong port | `npm run ports:kill <port>` |

**📚 Complete Guide:** [Multi-PWA Port Management](/project-docs/MULTI_PWA_PORT_MANAGEMENT.md) - Full setup, scripts, and best practices.

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
