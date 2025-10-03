# PWA Technical Implementation Guide

*Core technical patterns, architecture decisions, and implementation strategies for PWA development*

---

## 📋 Table of Contents

1. [PWA Architecture Patterns](#pwa-architecture-patterns)
2. [Module Loading & Dependencies](#module-loading--dependencies)
3. [PWA Architecture & Service Workers](#pwa-architecture--service-workers)
4. [State Management & Data Persistence](#state-management--data-persistence)
5. [Performance & Optimization](#performance--optimization)
6. [Technical Debugging](#technical-debugging)

---

## 🏗️ PWA Architecture Patterns

### **The Monolithic PWA Anti-Pattern**

#### **❌ What NOT to Do**
```javascript
// ❌ BAD - Everything in one massive class (3,741 lines!)
class PWAApp {
  constructor() {
    // 15+ manager instantiations
    this.blockManager = new BlockManager();
    this.petrificationManager = new PetrificationManager();
    this.deadPixelsManager = new DeadPixelsManager();
    this.blockPalette = new BlockPalette(/*...*/);
    this.scoringSystem = new ScoringSystem(/*...*/);
    // ... 10+ more managers
    
    // Game state mixed with UI state
    this.score = 0;
    this.level = 1;
    this.isDragging = false;
    this.selectedBlock = null;
    
    // Canvas operations mixed with game logic
    this.canvas = document.getElementById('game-board');
    this.ctx = this.canvas.getContext('2d');
  }
  
  // 3,700+ lines of mixed concerns
  placeBlock() { /* game logic + UI updates + sound + effects */ }
  updateUI() { /* everything touches everything */ }
  drawBoard() { /* rendering mixed with state */ }
}
```

**Problems This Creates:**
- 🔴 **Untestable** - Can't test game logic without DOM
- 🔴 **Unmaintainable** - Every feature touches the same file
- 🔴 **Merge Conflicts** - All developers modify the same 3,741 lines
- 🔴 **Circular Dependencies** - Everything depends on everything
- 🔴 **Performance Issues** - No lazy loading, everything instantiated at once
- 🔴 **Debug Complexity** - Hard to isolate issues
- 🔴 **Scaling Problems** - Adding features becomes exponentially harder

### **✅ The Refactored PWA Architecture**

#### **Separation of Concerns Pattern**
```
PWAApp (Orchestrator - 200 lines)
├── GameEngine (Pure Logic - 500 lines)
│   ├── Block placement logic
│   ├── Line clearing algorithms  
│   ├── Scoring calculations
│   └── Game state transitions
│
├── UIManager (DOM Interaction - 400 lines)
│   ├── Canvas rendering
│   ├── Event handling
│   ├── Animation management
│   └── Visual feedback
│
├── StateManager (Data Management - 200 lines)
│   ├── Game state persistence
│   ├── Settings synchronization
│   ├── Storage management
│   └── State change notifications
│
└── DependencyContainer (IoC - 100 lines)
    ├── Manager registration
    ├── Dependency resolution
    ├── Lifecycle management
    └── Testing support
```

#### **Key Architectural Principles**

**1. Separation of Concerns**
> Each component should have a single, well-defined responsibility.

```javascript
// ✅ GOOD - Pure business logic
class GameEngine {
  placeBlock(block, position) {
    // Pure game logic only
    const result = this.validatePlacement(block, position);
    if (!result.valid) return result;
    
    this.applyBlockToBoard(block, position);
    const scoreGained = this.calculateScore(block);
    this.updateGameState(scoreGained);
    
    return {
      success: true,
      scoreGained,
      newGameState: this.getState(),
      clearedLines: result.clearedLines
    };
  }
}

// ✅ GOOD - Pure UI logic
class UIManager {
  updateScore(newScore, animation = true) {
    const scoreElement = this.elements.score;
    if (animation) {
      this.animateScoreChange(scoreElement, newScore);
    } else {
      scoreElement.textContent = newScore;
    }
  }
  
  render(gameState) {
    // Declarative rendering based on state
    this.updateScore(gameState.score);
    this.updateLevel(gameState.level);
    this.renderBoard(gameState.board);
    this.updateBlockPalette(gameState.availableBlocks);
  }
}
```

**2. Dependency Inversion**
> Depend on abstractions, not concretions. Inject dependencies rather than creating them.

```javascript
// ✅ GOOD - Dependency injection
class GameEngine {
  constructor(dependencies) {
    this.storage = dependencies.storage;
    this.audio = dependencies.audio;
    // No direct imports - all injected
  }
}

// ✅ GOOD - Dependency container
class DependencyContainer {
  constructor() {
    this.services = new Map();
    this.registerServices();
  }
  
  registerServices() {
    this.services.set('storage', new StorageManager());
    this.services.set('audio', new AudioManager());
    this.services.set('gameEngine', new GameEngine({
      storage: this.services.get('storage'),
      audio: this.services.get('audio')
    }));
  }
  
  resolve(serviceName) {
    return this.services.get(serviceName);
  }
}
```

**3. Single Source of Truth**
> All state should live in one place and flow down through the application.

```javascript
// ✅ GOOD - Centralized state management
class StateManager {
  constructor() {
    this.gameState = new GameState();
    this.uiState = new UIState();
    this.settings = new Settings();
    this.observers = new Map();
  }
  
  updateGameState(changes) {
    const oldState = { ...this.gameState };
    Object.assign(this.gameState, changes);
    this.notifyObservers('gameState', this.gameState, oldState);
    this.persistGameState();
  }
  
  subscribe(stateType, callback) {
    // Observer pattern for state changes
    if (!this.observers.has(stateType)) {
      this.observers.set(stateType, []);
    }
    this.observers.get(stateType).push(callback);
  }
}
```

**4. Event-Driven Architecture**
> Components should communicate through events, not direct method calls.

```javascript
// ✅ GOOD - Event-driven communication
class GameEngine {
  placeBlock(block, position) {
    const result = this.validateAndPlace(block, position);
    
    // Emit event instead of direct UI update
    this.emit('blockPlaced', {
      block,
      position,
      result,
      newGameState: this.getState()
    });
    
    return result;
  }
}

class UIManager {
  constructor(gameEngine) {
    // Listen to game events
    gameEngine.on('blockPlaced', (event) => {
      this.updateScore(event.result.scoreGained);
      this.renderBoard(event.newGameState.board);
      this.showPlacementFeedback(event.block, event.position);
    });
  }
}
```

### **PWA Design Patterns**

#### **1. Observer Pattern for State**
```javascript
// Decoupled state updates
stateManager.subscribe('score', (newScore) => {
  uiManager.updateScore(newScore);
  audioManager.playScoreSound();
});
```

**Benefits:**
- ✅ Loose coupling
- ✅ Easy to add new observers
- ✅ Event-driven architecture

#### **2. Command Pattern for Actions**
```javascript
// Undoable actions
class PlaceBlockCommand {
  constructor(gameEngine, block, position) {
    this.gameEngine = gameEngine;
    this.block = block;
    this.position = position;
  }
  
  execute() {
    return this.gameEngine.placeBlock(this.block, this.position);
  }
  
  undo() {
    return this.gameEngine.removeBlock(this.block, this.position);
  }
}
```

**Benefits:**
- ✅ Undo/redo functionality
- ✅ Action queuing
- ✅ Macro commands

#### **3. Factory Pattern for Components**
```javascript
// Consistent component creation
class ComponentFactory {
  constructor() {
    this.managers = new Map();
    this.registerManagers();
  }
  
  createManager(type, dependencies) {
    const Manager = this.managers.get(type);
    return new Manager(dependencies);
  }
}
```

**Benefits:**
- ✅ Consistent initialization
- ✅ Easy to extend
- ✅ Configuration management

### **Architecture Red Flags**

Watch for these warning signs in PWA architecture:

- 🚨 **Any file over 1,000 lines**
- 🚨 **Business logic mixed with DOM manipulation**
- 🚨 **Circular dependencies between components**
- 🚨 **Global state accessed directly**
- 🚨 **Untestable code (requires full DOM setup)**
- 🚨 **Constructor side effects**
- 🚨 **Tight coupling between unrelated features**

### **PWA Architecture Checklist**

#### **Before Starting Development:**
- [ ] Design component boundaries upfront
- [ ] Plan dependency injection from day one
- [ ] Separate business logic from UI logic
- [ ] Design state management strategy
- [ ] Plan testing strategy (unit + integration)

---

## 🔄 **PWA Refactoring: From Monolith to Modular Architecture**

### **Real-World Refactoring Case Study: Blockdoku PWA**

*This section documents a complete refactoring of a 3,741-line monolithic PWA into a clean, modular architecture while maintaining 100% behavioral compatibility.*

#### **The Challenge**
- **3,741-line monolithic app.js** with mixed concerns
- **15+ manager dependencies** all instantiated in constructor
- **Untestable code** requiring full DOM setup
- **Merge conflicts** on every feature addition
- **Performance issues** from unnecessary instantiation

#### **The Solution: Testing-First Refactoring**

**Critical Success Factor: Comprehensive Testing**
> **"Never refactor without comprehensive tests. The confidence to change code comes from the certainty that you haven't broken anything."**

##### **Phase 1: Characterization Tests (Behavior Capture)**
```javascript
// BEFORE refactoring - capture CURRENT behavior
test('Complete placement workflow', () => {
    const gameEngine = new SimpleGameLogic();
    
    // Fill row except last position
    for (let col = 0; col < 8; col++) {
        gameEngine.board[0][col] = 1;
    }
    
    const block = testScenarios.blocks.single;
    const newBoard = gameEngine.placeBlockOnBoard(block, board, 0, 8);
    
    // Verify EXACT current behavior
    const completedLines = gameEngine.findCompletedLines(newBoard);
    assertEqual(completedLines.rows.length, 1, 'Should complete one row');
    
    const score = gameEngine.calculateClearScore(completedLines);
    assertEqual(score, 18, 'Should give exactly 18 points');
});
```

**Purpose:** Document what the system CURRENTLY does (not what it should do)
**Benefit:** Provides safety net during architectural changes

##### **Phase 2: Component Unit Tests (Isolated Verification)**
```javascript
// AFTER extraction - verify component works identically
test('GameEngine maintains exact same behavior', () => {
    const gameEngine = new GameEngine();
    
    // Same test scenario as characterization test
    const result = gameEngine.placeBlock(block, { row: 0, col: 8 });
    
    // Must produce IDENTICAL results
    assertEqual(result.scoreGained, 20, 'Total score should be 2 + 18 = 20');
    assertEqual(result.clearResult.clearedLines.rows.length, 1, 'Should clear one row');
});
```

**Purpose:** Ensure extracted components behave identically to original
**Benefit:** Catch regressions immediately during refactoring

##### **Phase 3: Integration Tests (System Verification)**
```javascript
// AFTER integration - verify system still works end-to-end
test('Full game workflow maintains behavior', () => {
    const container = new DependencyContainer();
    const gameEngine = container.resolve('gameEngine');
    const uiManager = container.resolve('uiManager');
    
    // Test complete user workflow
    const result = simulateGameSession(gameEngine, uiManager);
    
    // Verify system behavior unchanged
    assert(result.success, 'Game workflow should complete successfully');
});
```

**Purpose:** Verify refactored architecture works as a complete system
**Benefit:** Ensure component integration doesn't break user workflows

#### **Refactoring Results**

**Before Refactoring:**
```
app.js (3,741 lines)
├── Game logic mixed with UI
├── 15+ manager dependencies
├── Untestable code
├── Merge conflicts on every change
└── Performance bottlenecks
```

**After Refactoring:**
```
BlockdokuGame (400 lines)
├── DependencyContainer - Manages all dependencies
├── GameEngine - Pure game logic (500 lines)
├── UIManager - Rendering and DOM (400 lines)
├── StateManager - Centralized state (400 lines)
└── GameStorage - Persistence layer (existing)
```

**Metrics:**
- **3,741 → 400 lines** - Reduced monolithic app.js by 89%
- **66 Total Tests** - 100% pass rate throughout refactoring
- **Zero Breaking Changes** - All original functionality maintained
- **Modular Architecture** - 4 focused, testable components

#### **Key Refactoring Lessons**

##### **1. Testing Foundation is Critical**
- **24 Characterization Tests** captured current behavior
- **32 Unit Tests** verified component isolation
- **10 Integration Tests** ensured system coherence
- **100% Pass Rate** maintained throughout entire process

##### **2. Extract Gradually, Test Continuously**
```
1. Write Characterization Tests → Capture current behavior
2. Run Tests → Establish baseline (must be 100% pass)
3. Extract Component → Create new architecture
4. Write Component Tests → Verify identical behavior  
5. Run All Tests → Ensure no regressions
6. Integrate Component → Wire into system
7. Run Integration Tests → Verify system works
8. Repeat → Next component extraction
```

##### **3. Dependency Injection Enables Testing**
```javascript
// ❌ BAD - Hard to test
class GameEngine {
    constructor() {
        this.storage = new GameStorage(); // Hard dependency
        this.audio = new AudioManager();  // Hard dependency
    }
}

// ✅ GOOD - Easy to test
class GameEngine {
    constructor(dependencies) {
        this.storage = dependencies.storage; // Injected
        this.audio = dependencies.audio;     // Injected
    }
}
```

##### **4. State Management Centralization**
```javascript
// ❌ BAD - State scattered everywhere
class GameEngine {
    constructor() {
        this.score = 0;
        this.level = 1;
        // State mixed with logic
    }
}

class UIManager {
    constructor() {
        this.isDragging = false;
        this.selectedBlock = null;
        // UI state separate from game state
    }
}

// ✅ GOOD - Centralized state management
class StateManager {
    constructor() {
        this.gameState = { score: 0, level: 1, /* ... */ };
        this.uiState = { isDragging: false, selectedBlock: null };
    }
    
    updateGameState(updates) {
        this.gameState = { ...this.gameState, ...updates };
        this.notifyObservers('gameState', this.gameState);
    }
}
```

#### **Testing Anti-Patterns That Lead to Refactoring Failure**

##### **❌ Anti-Pattern 1: "Test What Should Happen" Instead of "What Currently Happens"**
```javascript
// WRONG - Testing ideal behavior during refactoring
test('Score calculation', () => {
    assertEqual(calculateScore(block), 10, 'Should give 10 points'); // Wishful thinking
});

// RIGHT - Testing current behavior during refactoring
test('Score calculation (current behavior)', () => {
    assertEqual(calculateScore(block), 7, 'Currently gives 7 points'); // Actual behavior
});
```

##### **❌ Anti-Pattern 2: "Refactor First, Test Later"**
```javascript
// WRONG - Refactoring without safety net
class NewGameEngine {
    // Refactored code with no verification it works the same
    placeBlock(block, position) {
        // Hope this works the same as before...
        return this.newImprovedLogic(block, position);
    }
}
```

##### **❌ Anti-Pattern 3: "Only Test Happy Paths"**
```javascript
// WRONG - Missing edge cases
test('Block placement', () => {
    assert(placeBlock(validBlock, validPosition), 'Should place valid block');
    // Missing: invalid blocks, boundary conditions, error cases
});

// RIGHT - Comprehensive behavior capture
test('Block placement edge cases', () => {
    assert(placeBlock(validBlock, outOfBounds), 'Should reject out of bounds');
    assert(!placeBlock(null, validPosition), 'Should reject null block');
    assert(!placeBlock(validBlock, collision), 'Should reject collisions');
});
```

#### **The Bottom Line**

> **"This refactoring succeeded because we had 66 tests providing a safety net. Without them, we would have been flying blind through 3,741 lines of complex code. The tests didn't just verify our refactoring worked - they made the refactoring possible in the first place."**

**Every future PWA project should budget 30-40% of refactoring time for comprehensive testing. It's not overhead - it's the foundation that makes safe architectural evolution possible.**

#### **During Development:**
- [ ] Keep components under 500 lines
- [ ] Write tests for business logic first
- [ ] Use dependency injection for all external dependencies
- [ ] Implement observer pattern for state changes
- [ ] Regular architectural reviews

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

---

### ES Modules & Vite Bundling

**CRITICAL**: When using Vite as your build tool, JavaScript must use ES modules for proper bundling.

#### **The Problem**

**Symptom:** Production site loads but JavaScript doesn't execute, shows 404 errors for JS files
```
Failed to load resource: the server responded with a status of 404
StorageManager.js:1  Failed to load resource: 404
ThemeManager.js:1    Failed to load resource: 404
```

**Root Cause:** Vite requires `type="module"` on script tags to know which files to bundle.

#### **❌ WRONG - Global Script Pattern**

```html
<!-- index.html -->
<script src="js/utils/StorageManager.js"></script>
<script src="js/utils/ThemeManager.js"></script>
<script src="js/PWAApp.js"></script>
```

```javascript
// StorageManager.js
class StorageManager {
  // ... implementation
}

// Make globally available
window.StorageManager = StorageManager;  // ❌ Old pattern
```

**What happens:**
- Vite doesn't recognize these as modules to bundle
- HTML references are copied as-is to production
- Individual JS files don't exist in `/docs` (not bundled)
- Production fails with 404 errors

#### **✅ CORRECT - ES Module Pattern**

```html
<!-- index.html -->
<script type="module" src="js/PWAApp.js"></script>
<!-- ↑ CRITICAL: type="module" tells Vite to bundle this -->
```

```javascript
// StorageManager.js
class StorageManager {
  // ... implementation
}

// Export as ES module
export default StorageManager;  // ✅ Correct
```

```javascript
// PWAApp.js - Single entry point with imports
import StorageManager from './utils/StorageManager.js';
import ThemeManager from './utils/ThemeManager.js';
import NotificationManager from './utils/NotificationManager.js';

class PWAApp {
  constructor() {
    this.storageManager = new StorageManager();
    this.themeManager = new ThemeManager();
    // ...
  }
}

// Initialize
const app = new PWAApp();
```

**What happens:**
- Vite sees `type="module"` and knows to bundle
- Follows all imports from entry point
- Bundles everything into `/docs/assets/main-[hash].js`
- Production HTML gets: `<script type="module" src="./assets/main-[hash].js">`
- Works perfectly! ✅

#### **Migration Steps**

If you have an existing project with global scripts:

1. **Add ES module exports** to all JS files:
   ```bash
   # Replace in all files:
   sed -i '' 's|window.ClassName = ClassName|export default ClassName|g' *.js
   ```

2. **Add imports** to entry point (PWAApp.js or main.js):
   ```javascript
   import StorageManager from './utils/StorageManager.js';
   import ThemeManager from './utils/ThemeManager.js';
   // ... all other dependencies
   ```

3. **Update HTML** to single module script:
   ```html
   <!-- Remove all individual script tags -->
   <!-- Add single entry point -->
   <script type="module" src="js/PWAApp.js"></script>
   ```

4. **Test build**:
   ```bash
   npm run build
   # Check docs/ for bundled assets/main-[hash].js
   ```

#### **Key Rules**

| Rule | Why | Example |
|------|-----|---------|
| **One entry point** | Vite bundles from single source | `PWAApp.js` imports everything |
| **Use `export default`** | ES modules, not globals | `export default ClassName` |
| **Use `import`** | Declare dependencies | `import Theme from './Theme.js'` |
| **Add `type="module"`** | Tells Vite to bundle | `<script type="module" src="...">` |

#### **Development vs Production**

```
DEVELOPMENT (npm run dev):
└─ index.html
   └─ <script type="module" src="js/PWAApp.js">
      ├─ StorageManager.js     ← Served individually
      ├─ ThemeManager.js       ← Hot module reload
      └─ ...                   ← Fast refresh

PRODUCTION (npm run build):
└─ index.html
   └─ <script type="module" src="./assets/main-a1b2c3.js">
      └─ [All code bundled, minified, tree-shaken]
```

Both work identically because ES modules are used correctly!

#### **Common Mistakes**

```javascript
// ❌ WRONG - Missing export
class MyClass {}
// Nothing - Vite can't find this

// ❌ WRONG - CommonJS (Node.js style)
module.exports = MyClass;  // Doesn't work in browser

// ❌ WRONG - Named export when using default import
export { MyClass };  // Import won't match

// ✅ CORRECT - ES module default export
export default MyClass;
```

#### **Real-World Example**

**Problem:** `pea.523.life` stuck at "Loading..." with JS 404 errors

**Solution:**
- Converted 7 JS files from `window.X = X` to `export default X`
- Added imports to `PWAApp.js`
- Changed HTML from 7 script tags to 1 with `type="module"`
- Build produced single `main-[hash].js` bundle
- Production site worked perfectly ✅

**Files changed:** [See commit 979425a]

---

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

### PWA Performance Patterns from Real Refactoring

#### **Performance Transformation Results**
- **Before Refactoring**: 2-3 second initialization, high memory usage, large bundle size
- **After Refactoring**: <1 second initialization, optimized memory, smaller bundle size

#### **1. Lazy Loading Pattern**
```javascript
// Load managers only when needed
class PWAApp {
  constructor() {
    this.features = new Map();
  }
  
  async loadGameFeature(featureName) {
    if (!this.features.has(featureName)) {
      const module = await import(`./features/${featureName}.js`);
      this.features.set(featureName, new module.default());
    }
    return this.features.get(featureName);
  }
  
  async initialize() {
    // Load only critical features immediately
    await this.loadGameFeature('core');
    
    // Load optional features on demand
    this.setupLazyLoading();
  }
  
  setupLazyLoading() {
    // Load features when user interacts with them
    document.getElementById('settings-btn').addEventListener('click', async () => {
      const settingsManager = await this.loadGameFeature('settings');
      settingsManager.show();
    });
  }
}
```

**Benefits:**
- ✅ **Faster Initial Load** - Only critical code loads immediately
- ✅ **Reduced Memory Usage** - Features loaded only when needed
- ✅ **Better User Experience** - App appears to load faster
- ✅ **Smaller Initial Bundle** - Tree shaking works better

#### **2. Object Pooling Pattern**
```javascript
// Reuse objects instead of creating new ones
class ParticlePool {
  constructor(size = 100) {
    this.pool = Array(size).fill(null).map(() => new Particle());
    this.available = [...this.pool];
  }
  
  acquire() {
    return this.available.pop() || new Particle();
  }
  
  release(particle) {
    particle.reset();
    this.available.push(particle);
  }
}

// Usage in effects manager
class EffectsManager {
  constructor() {
    this.particlePool = new ParticlePool(200);
  }
  
  createExplosion(position) {
    const particles = [];
    for (let i = 0; i < 20; i++) {
      const particle = this.particlePool.acquire();
      particle.initialize(position);
      particles.push(particle);
    }
    return particles;
  }
  
  cleanupExplosion(particles) {
    particles.forEach(particle => {
      this.particlePool.release(particle);
    });
  }
}
```

**Benefits:**
- ✅ **Reduced Garbage Collection** - Fewer object allocations
- ✅ **Consistent Performance** - No memory spikes during effects
- ✅ **Memory Efficiency** - Reuse objects instead of creating new ones

#### **3. Event Delegation Pattern**
```javascript
// Single event listener instead of many
class UIManager {
  constructor(container) {
    this.container = container;
    this.setupEventDelegation();
  }
  
  setupEventDelegation() {
    // Single event listener for all interactions
    this.container.addEventListener('click', (e) => {
      const handler = this.getHandler(e.target);
      if (handler) handler(e);
    });
    
    this.container.addEventListener('touchstart', (e) => {
      const handler = this.getTouchHandler(e.target);
      if (handler) handler(e);
    });
  }
  
  getHandler(element) {
    // Find the appropriate handler based on element
    if (element.matches('.block-palette .block')) {
      return this.handleBlockSelection.bind(this);
    }
    if (element.matches('.game-board .cell')) {
      return this.handleCellClick.bind(this);
    }
    if (element.matches('.settings-btn')) {
      return this.handleSettingsClick.bind(this);
    }
    return null;
  }
}
```

**Benefits:**
- ✅ **Better Performance** - Fewer event listeners
- ✅ **Dynamic Content** - Works with dynamically added elements
- ✅ **Memory Efficiency** - Single listener instead of many
- ✅ **Easier Management** - Centralized event handling

#### **4. Mobile Performance Optimization**
```javascript
// Throttled updates for mobile
class GameLoop {
  constructor() {
    this.isMobile = this.detectMobile();
    this.targetFPS = this.isMobile ? 30 : 60;
    this.frameTime = 1000 / this.targetFPS;
    this.lastFrame = 0;
  }
  
  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  start() {
    this.loop();
  }
  
  loop(currentTime = 0) {
    const deltaTime = currentTime - this.lastFrame;
    
    if (deltaTime >= this.frameTime) {
      this.update(deltaTime);
      this.render();
      this.lastFrame = currentTime;
    }
    
    requestAnimationFrame((time) => this.loop(time));
  }
}
```

**Benefits:**
- ✅ **Battery Life** - Lower frame rate on mobile saves battery
- ✅ **Smooth Performance** - Consistent frame rate across devices
- ✅ **Adaptive** - Automatically adjusts to device capabilities

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
