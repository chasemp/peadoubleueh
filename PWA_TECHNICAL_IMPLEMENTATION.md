# PWA Technical Implementation Guide

*Core technical patterns, architecture decisions, and implementation strategies for PWA development*

---

## 📋 Table of Contents

1. [Module Loading & Dependencies](#module-loading--dependencies)
2. [PWA Architecture & Service Workers](#pwa-architecture--service-workers)
3. [State Management & Data Persistence](#state-management--data-persistence)
4. [Performance & Optimization](#performance--optimization)
5. [Technical Debugging](#technical-debugging)

---

## 📚 Module Loading & Dependencies

### Static vs Dynamic Imports

#### **The Problem**
- **Static imports** (`import { Module } from '/path'`) load immediately when the module is parsed
- **Dynamic imports** (`import('/path')`) load asynchronously when called
- **Critical Issue**: Static imports can prevent entire modules from loading if there are path errors

#### **What We Learned**
```javascript
// ❌ PROBLEMATIC - Static import fails silently, breaks entire module
import { PWAInstallManager } from '/js/pwa/install.js'; // Wrong path!

// ✅ WORKING - Dynamic import loads successfully
import('/js/pwa/install.js').then(module => {
    // Handle loaded module
});
```

#### **Best Practices**
1. **Use static imports** for core dependencies that must be available immediately
2. **Use dynamic imports** for optional features, PWA modules, or lazy-loaded content
3. **Always verify import paths** - static import failures are silent and hard to debug
4. **Test both import types** during development to catch path issues early

### Self-Contained PWA: Local Libraries vs CDNs

#### **The Problem with CDN Dependencies**
Even when third-party libraries are "cached" by CDNs, they create external dependencies that compromise PWA reliability:

- **Network Dependency**: CDN failures break your entire app
- **Version Drift**: CDN versions can change unexpectedly
- **Performance Variability**: CDN speed varies by geographic location
- **Privacy Concerns**: Third-party requests can be tracked
- **Offline Capability**: CDNs prevent true offline functionality
- **Content Security**: External scripts create security vulnerabilities

#### **Real-World Example: Chart.js CDN Issue**
The SAMM360 project initially used Chart.js via CDN:
```html
<!-- ❌ PROBLEMATIC - External CDN dependency -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

**Issues Encountered:**
- Charts failed to load on slow connections
- Inconsistent loading times across different regions
- Complete app failure when CDN was unavailable
- Charts appeared broken until CDN loaded

**Solution Applied:**
```bash
# Download Chart.js locally
curl -o public/libs/chart.min.js https://cdn.jsdelivr.net/npm/chart.js/dist/chart.min.js
```

```html
<!-- ✅ BETTER - Local copy for reliability -->
<script src="./public/libs/chart.min.js"></script>
```

#### **Implementation Strategy**
1. **Download libraries locally** during development:
   ```bash
   curl -o public/libs/phaser.min.js https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js
   ```

2. **Update service worker** to cache local libraries:
   ```javascript
   const PRECACHE_URLS = [
     '/public/libs/phaser.min.js',  // Local copy
     // Remove CDN URLs entirely
   ];
   ```

3. **Verify library integrity** - check file size and test functionality
4. **Update all references** from CDN to local paths
5. **Remove CDN logic** from caching and asset detection

#### **Benefits Achieved**
- ✅ **Zero External Dependencies**: Completely offline-capable
- ✅ **Faster Loading**: Local assets load faster than CDN on repeat visits
- ✅ **Better Reliability**: No network failures from external services
- ✅ **Perfect for Static Hosting**: Ideal for GitHub Pages deployment
- ✅ **Consistent Performance**: No CDN availability or speed variations
- ✅ **Enhanced Security**: No third-party content security concerns

#### **File Size Considerations**
- **Phaser 3.90.0**: 1.1MB (reasonable for a complete game engine)
- **Most libraries**: Under 500KB when minified
- **Trade-off**: Slightly larger initial download for complete self-sufficiency
- **Best Practice**: Only include libraries you actually use

---

## 🔧 PWA Architecture & Service Workers

### Service Worker Registration

```javascript
// ✅ Correct path resolution
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/public/sw.js')
        .then(registration => console.log('SW registered'))
        .catch(error => console.log('SW registration failed'));
}
```

### Manifest File Paths

```json
{
    "icons": [
        {
            "src": "/public/icons/icon-192x192.png", // ✅ Absolute paths
            "sizes": "192x192",
            "type": "image/png"
        }
    ]
}
```

### Duplicate Button Prevention

```javascript
// ✅ Check for existing elements before creating
createInstallButton() {
    if (document.getElementById('install-button')) {
        this.installButton = document.getElementById('install-button');
        return;
    }
    // Create new button...
}
```

### Versioning & Build Info

#### **Our Versioning Scheme**
- **Semantic Version + Build Metadata**: `MAJOR.MINOR.PATCH+BUILD`
- **Example**: `1.4.0+20250929-0506`
  - `1.4.0`: From `package.json`.
  - `20250929-0506`: Build identifier `YYYYMMDD-HHMM` generated at build time.

#### **How It's Generated**
- The script `scripts/generate-build-info.js` runs on `prebuild` and `postbuild`.
- It writes `build-info.json` to the repo root and `src/` with fields:
```json
{
  "version": "1.4.0",
  "buildId": "20250929-0506",
  "buildDate": "2025-09-29T05:06:53.188Z",
  "fullVersion": "1.4.0+20250929-0506"
}
```

#### **Why This Helps**
- **Traceability**: Unique build ID per deployment.
- **Supportability**: Users can report exact build from Settings → About.
- **Automation**: CI/CD and release notes can reference the same build string.

---

## 🔄 State Management & Data Persistence

### Preserving Local Data Across PWA Upgrades

#### **The Problem**
- Upgrades changed localStorage key names (e.g., `blockdoku-settings` vs `blockdoku_settings`), risking loss of settings and stats.
- Some pages read keys directly, others via a storage module, causing mismatches.
- Service Worker and manifest upgrades can confuse users if they appear to "reset" the app (cache cleared, theme reset), even if data still exists.

#### **What We Did**
- Introduced a storage migration that copies legacy keys into canonical ones without deleting the legacy keys immediately.
- Updated all storage listeners to watch both old and new keys during a transition period.
- Adjusted HTML pages that read settings directly from `localStorage` to try canonical first, then legacy.
- Standardized the in-progress game key lookup to the canonical key provided by the storage module.

#### **Code Patterns**
```javascript
// In storage module constructor
this.migrateLegacyKeys = function () {
  try {
    const legacySettings = localStorage.getItem('blockdoku-settings');
    const currentSettings = localStorage.getItem('blockdoku_settings');
    if (legacySettings && !currentSettings) {
      localStorage.setItem('blockdoku_settings', legacySettings);
    }

    const legacyGame = localStorage.getItem('blockdoku_game_state');
    const currentGame = localStorage.getItem('blockdoku_game_data');
    if (legacyGame && !currentGame) {
      localStorage.setItem('blockdoku_game_data', legacyGame);
    }
  } catch {}
};

// Storage event listeners
window.addEventListener('storage', (e) => {
  if (e.key === 'blockdoku-settings' || e.key === 'blockdoku_settings') {
    reloadSettings();
  }
});

// Direct reads from HTML pages
const savedSettings = localStorage.getItem('blockdoku_settings')
  || localStorage.getItem('blockdoku-settings');
```

#### **Best Practices**
- Prefer a single canonical key per data domain with a stable prefix (e.g., `app_*`).
- When renaming keys, migrate by copying to the new key; keep the old key for one or two releases before removal.
- Don't call `localStorage.clear()` in any update flow.
- Avoid manifest changes that move the app to a different origin or drastically alter `scope`/`start_url` in ways that might break URLs or confound caches for existing installations.
- Service Worker updates: precache new assets, clean outdated caches, but leave storage alone (SW cannot access localStorage anyway). Communicate updates quietly and don't disrupt the session.

### Settings Synchronization Anti-Pattern

#### **The Problem:**
```javascript
// ❌ DANGEROUS: Hardcoded defaults before loading from storage
class SettingsManager {
    constructor() {
        this.currentDifficulty = 'normal'; // Hardcoded!
        this.settings = this.storage.loadSettings(); // Loaded after default
    }
}
```

**The Bug:** Theme changes reset difficulty because `saveSettings()` saved the hardcoded default instead of the user's actual setting.

#### **The Fix:**
```javascript
// ✅ CORRECT: Load from storage FIRST, then set defaults
class SettingsManager {
    constructor() {
        this.settings = this.storage.loadSettings();
        this.currentDifficulty = this.settings.difficulty || 'normal'; // Default only if not found
    }
}
```

**Lesson:** **Never hardcode defaults before loading user data.** Always load first, then apply defaults for missing values.

### Centralized State Management

#### **Multi-Page State Sync Issues**
- Main game page and settings page both modify same localStorage
- Window focus events used for sync (fragile)
- Race conditions during rapid navigation

#### **Better Pattern**
```javascript
// Centralized state management
class GameStateManager {
    static instance = null;
    
    static getInstance() {
        if (!GameStateManager.instance) {
            GameStateManager.instance = new GameStateManager();
        }
        return GameStateManager.instance;
    }
    
    // Single source of truth for all pages
    updateDifficulty(difficulty) {
        this.state.difficulty = difficulty;
        this.persistToStorage();
        this.notifyAllPages('difficultyChanged', difficulty);
    }
}
```

---

## 🏗️ Static Site Generation Patterns

### Template-Based Generation

#### **The SAMM360 Approach**
The SAMM360 project uses a Python-based static site generator that creates a complete PWA from templates:

```python
# Template generation pattern
def generate_index_html(practice_objectives=None, security_practices=None, version=None):
    """Generate the main HTML file."""
    html = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SAMM360 - OWASP SAMM 360° Assessment Tool</title>
  <link rel="stylesheet" href="style.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <!-- Generated content -->
</body>
</html>'''
    return html
```

#### **Key Benefits**
- **Consistent Output**: Same template generates identical structure every time
- **Version Control**: Template changes are tracked in source control
- **Testing**: Generated output can be validated and tested
- **Maintainability**: Single source of truth for HTML structure

#### **File Organization Pattern**
```
generated/                 # Generated static files
├── index.html           # Main application page
├── style.css            # Styling and layout
├── samm.js              # Core application logic
├── samm-scoring.js      # Scoring calculations
└── samm_data.js         # Data structure
```

### Dynamic Content Injection

#### **The Problem**
Static sites need dynamic content (data, configuration) injected at build time.

#### **The Solution: Data Injection Pattern**
```python
def generate_samm_js(embedded_assessment_data=None):
    """Generate the main JavaScript application logic."""
    
    # Inject data at build time
    if embedded_assessment_data:
        data_injection = f"""
// Auto-load assessment data
document.addEventListener('DOMContentLoaded', function() {{
    loadAssessmentData({json.dumps(embedded_assessment_data)});
}});
"""
    else:
        data_injection = "// No embedded data - user will upload"
    
    return f'''// SAMM Assessment Application
{data_injection}

// Rest of application logic...
'''
```

#### **Benefits of Build-Time Data Injection**
- **Performance**: No runtime data loading
- **Offline Capability**: All data embedded in static files
- **Consistency**: Same data structure across all deployments
- **Security**: No runtime data fetching vulnerabilities

### GitHub Pages Deployment Integration

#### **Automated Deployment Pattern**
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ develop ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      - name: Generate static site
        run: |
          python3 create_samm360_site.py --output-dir docs
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

#### **Key Deployment Lessons**
1. **Separate output directories** for development vs production
2. **Automated generation** on every push
3. **Version tracking** in generated files
4. **Clean builds** - no leftover files from previous runs

### Build Process Optimization

#### **Incremental Generation**
```python
def should_regenerate_file(source_file, output_file):
    """Check if file needs regeneration based on modification time."""
    if not os.path.exists(output_file):
        return True
    
    source_mtime = os.path.getmtime(source_file)
    output_mtime = os.path.getmtime(output_file)
    
    return source_mtime > output_mtime
```

#### **Asset Management**
```python
def clean_output_directory(output_dir):
    """Clean output directory before generation."""
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)
    os.makedirs(output_dir, exist_ok=True)
```

#### **Version Information Injection**
```python
def inject_version_info(html_content, version):
    """Inject version information into generated HTML."""
    version_display = f"SAMM360 {version} | {get_git_commit_hash()}"
    return html_content.replace('{version_display}', version_display)
```

---

## ⚡ Performance & Optimization

### Haptic Feedback Non-Blocking Implementation

#### **The Problem**
Mobile navigation required multiple clicks to work because `navigator.vibrate()` was being blocked by browser security, somehow interfering with click event handling.

#### **Root Cause**
Browsers block vibration API until user has interacted with the page. The blocking/error was preventing subsequent JavaScript execution.

#### **Solution**
Make haptic feedback completely asynchronous and non-blocking:
```javascript
addHapticFeedback() {
    // Execute in separate async context to never block main thread
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

#### **Key Principles**
- **Core functionality first**: Navigation must work regardless of haptic feedback
- **Progressive enhancement**: Haptic feedback is nice-to-have, not essential
- **Async execution**: Use `setTimeout(0)` to prevent blocking main thread
- **Silent failure**: Don't log errors for expected browser security blocks

### Build Asset Management

#### **What We Discovered**
79+ build asset files accumulating in `/assets/`
- Multiple versions of same components
- Vite generating excessive artifacts
- No cleanup strategy

#### **Impact**
- Repository bloat
- Confusion about which assets are current
- Deployment complexity

#### **Prevention**
```javascript
// vite.config.js - Control asset generation
export default {
    build: {
        rollupOptions: {
            output: {
                // Cleaner asset naming
                assetFileNames: '[name].[hash][extname]',
                chunkFileNames: '[name].[hash].js',
            }
        }
    }
}
```

**Lesson:** Monitor build outputs regularly. Set up asset cleanup as part of the build process.

---

## 🐛 Technical Debugging

### CSS Timing and Visibility Issues

#### **The Problem Pattern**
Elements become visible only when JavaScript console is opened, indicating timing conflicts between CSS loading and DOM manipulation.

#### **Common Symptoms**
- Elements appear "invisible" or "transparent"
- Highlighting elements shows they exist in DOM
- Opening dev console makes elements suddenly visible
- CSS rules exist but don't apply immediately

#### **Root Causes**
1. **CSS Loading Order**: CSS loads after JavaScript DOM manipulation
2. **CSS Specificity Conflicts**: Existing styles override new styles
3. **Timing Race Conditions**: JavaScript sets styles before CSS is fully parsed
4. **Browser Repaint Issues**: DOM changes don't trigger visual updates

#### **Proven Solutions (in order of preference)**

**1. Inline Styles (Most Reliable)**
```html
<button style="display: block !important; visibility: visible !important; opacity: 1 !important;">
```
- ✅ Bypasses CSS loading order completely
- ✅ Highest specificity (beats all external CSS)
- ✅ Immediate application

**2. JavaScript Timing Fixes**
```javascript
setTimeout(() => {
    const element = document.getElementById('problematic-element');
    if (element) {
        element.style.display = 'block';
        element.style.visibility = 'visible';
        element.style.opacity = '1';
    }
}, 100);
```
- ✅ Forces styles after DOM/CSS settle
- ✅ Works around race conditions

**3. Aggressive CSS with !important**
```css
.problematic-element {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    z-index: 9999 !important;
    position: relative !important;
}
```
- ⚠️ Backup solution only
- ⚠️ May not work if CSS loads late

#### **Debugging Commands**
```javascript
// Check if element exists
console.log('Element exists:', !!document.getElementById('element-id'));

// Check computed styles
const el = document.getElementById('element-id');
console.log('Computed styles:', window.getComputedStyle(el));

// Force repaint
el.style.display = 'none';
el.offsetHeight; // Trigger reflow
el.style.display = 'block';
```

#### **Known Problematic Elements**
- Upload buttons in dynamically generated tabs
- Chart containers with dynamic sizing
- Elements added via JavaScript after page load

### Canvas Not Rendering
- **Check canvas dimensions** (width/height attributes vs CSS)
- **Verify context is available** (`canvas.getContext('2d')`)
- **Test with simple drawing** (`ctx.fillRect(0, 0, 10, 10)`)
- **Check if canvas is in viewport** (`getBoundingClientRect()`)

### Module Loading Failures
- **Check browser console** for 404 errors
- **Verify file paths** are correct
- **Test both static and dynamic imports**
- **Use network tab** to see what's actually loading

### Service Worker Issues
- **Check registration path** - must be absolute from root
- **Verify manifest paths** - use absolute paths for icons
- **Test offline functionality** - ensure all assets are cached
- **Check for duplicate elements** - prevent multiple install buttons

### State Management Issues
- **Check localStorage key consistency** - ensure all pages use same keys
- **Verify migration logic** - test with old data format
- **Test cross-page synchronization** - ensure changes persist
- **Check for hardcoded defaults** - ensure user data isn't overridden

### Common Technical Mistakes
- ❌ **Using CDN dependencies** - compromises offline capability
- ❌ **Hardcoding defaults before loading user data** - causes settings to reset
- ❌ **Inconsistent localStorage keys** - causes data loss during upgrades
- ❌ **Not testing module loading** - silent failures break functionality
- ❌ **Forgetting asset cleanup** - causes repository bloat

---

## 💡 Key Technical Takeaways

- **Always use local copies of libraries** - even "cached" CDNs compromise PWA reliability and offline capability
- **Never hardcode defaults before loading user data** - always load first, then apply defaults
- **Plan for data migration** when changing storage keys - users lose data otherwise
- **Use dynamic imports for optional features** - static imports can break entire modules
- **Make browser API calls non-blocking** - especially for progressive enhancement features
- **Monitor build outputs regularly** - prevent asset proliferation
- **Test module loading early and often** - silent failures are hard to debug
- **Use centralized state management** - prevents sync issues between pages

---

*This guide focuses on technical implementation patterns. For mobile UX considerations, see [PWA Mobile UX Guide](./PWA_MOBILE_UX_GUIDE.md). For development workflow and testing, see [PWA Development Workflow Guide](./PWA_DEVELOPMENT_WORKFLOW.md).*
