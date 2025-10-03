# PWA Deployment Architecture: The /src → /docs Pattern

**Purpose:** Deep dive into the deployment architecture that prevents the most destructive PWA development issue  
**Audience:** Architects, senior developers, team leads setting up new PWA projects  
**Status:** Production-proven pattern (October 2025)

---

## 📋 Table of Contents

1. [The Problem](#the-problem)
2. [The Solution](#the-solution)
3. [Architecture Design](#architecture-design)
4. [Implementation Guide](#implementation-guide)
5. [Protection Strategies](#protection-strategies)
6. [Build Process](#build-process)
7. [GitHub Pages Integration](#github-pages-integration)
8. [Troubleshooting](#troubleshooting)
9. [Migration Strategy](#migration-strategy)

---

## The Problem

### What We Built (Initially - Wrong)

```
my-pwa/
├── index.html          # ❌ Is this source or built?
├── settings.html       # ❌ Last edited when?
├── js/
│   ├── app.js         # ❌ Has my changes?
│   └── ...
├── src/
│   ├── index.html     # ❌ Which is newer?
│   └── ...
├── docs/              # ❌ Project documentation
│   └── README.md
└── dist/              # ❌ Sometimes exists?
```

### Symptoms Experienced

**In Blockdoku (Oct 2024-2025):**
- 6+ PRs created to "fix" issues that were just stale builds
- Weeks of circular debugging
- PR #92: "Settings not visible" - code was fine, deployment was stale
- Multiple instances of "I thought we fixed this already?"
- AI and humans both editing wrong files
- Impossible to answer "what's the latest version?"

**Build Churn:**
```bash
$ git status
modified: build-info.json        # Timestamp changed
modified: build                  # Date changed
modified: src/build-info.json    # Duplicate with different timestamp
```
Every commit = 3 files changed just from timestamps.

### Root Cause Analysis

1. **Architectural**: No clear separation between source and artifacts
2. **Configuration**: Build tools outputting to wrong locations
3. **Process**: Manual build step, easy to forget
4. **Protection**: Nothing preventing edits to generated files
5. **Organizational**: Documentation competing with build output for `/docs`

**Impact:** This single architectural mistake cost more development time than any other issue across multiple PWA projects.

---

## The Solution

### The Pattern

```
Clear separation with automation and protection
```

**Simple rule:** 
- `/src` = Source of truth (humans edit here)
- `/docs` = Build artifacts (robots generate here)
- Never the twain shall meet

### Architecture Philosophy

1. **Single Source of Truth**: Everything comes from `/src`
2. **Generated is Separate**: Built files live in `/docs`, never mixed
3. **Automation Required**: Pre-commit hook ensures consistency
4. **Multiple Protections**: Layers prevent mistakes
5. **Clean Commits**: Build artifacts gitignored where appropriate

---

## Architecture Design

### Directory Structure

```
your-pwa/
├── .git/
│   └── hooks/
│       └── pre-commit              # 🤖 Automates everything
│
├── src/                            # ✅ SOURCE CODE
│   ├── index.html                  # Edit this
│   ├── settings.html
│   ├── js/
│   │   ├── app.js
│   │   ├── core/
│   │   ├── ui/
│   │   └── ...
│   ├── css/
│   │   ├── main.css
│   │   └── themes/
│   └── assets/
│       └── images/
│
├── docs/                           # 🤖 BUILD OUTPUT
│   ├── index.html                  # Generated from src/index.html
│   ├── settings.html               # Generated from src/settings.html
│   ├── assets/                     # Bundled, minified, hashed
│   │   ├── main-[hash].js         # All JS bundled
│   │   ├── main-[hash].css        # All CSS bundled
│   │   └── ...
│   ├── build                       # Quick version reference
│   ├── build-info.json             # Metadata for app
│   ├── manifest.json               # From public/
│   ├── icons/                      # From public/
│   ├── sw.js                       # Service worker
│   └── CNAME                       # Custom domain
│
├── public/                         # 📦 STATIC ASSETS
│   ├── manifest.json               # Copied as-is to /docs
│   ├── icons/
│   │   ├── icon-192x192.png
│   │   └── ...
│   ├── favicon.ico
│   └── ...
│
├── project-docs/                   # 📚 PROJECT DOCUMENTATION
│   ├── README.md                   # Project-specific docs
│   ├── architecture/
│   └── ...
│
├── tests/                          # 🧪 TEST FILES
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/                        # 🛠️ BUILD SCRIPTS
│   ├── generate-build-info.js      # Creates build metadata
│   └── add-warnings-to-docs.cjs    # Adds warnings to HTML
│
├── .gitignore                      # Ignore build artifacts at root
├── .gitattributes                  # Mark /docs as generated
├── .cursorrules                    # Warn AI about /docs
├── vite.config.js                  # Build configuration
├── package.json                    # Scripts and dependencies
├── QUICK_START.md                  # Developer quick reference
└── README.md                       # Points to full docs
```

### File Flow

```
Developer edits:
  /src/index.html

↓ npm run dev (local development)

Dev server serves:
  http://localhost:3456
  Directly from /src with hot reload

↓ git commit (triggers pre-commit hook)

Hook runs:
  1. npm test → All tests must pass
  2. npm run build → Vite builds /src → /docs
  3. cp build docs/build
  4. cp build-info.json docs/build-info.json
  5. git add docs/

↓ Commit succeeds

Working directory clean:
  /src changes: committed
  /docs changes: committed (auto-generated)
  /build, /build-info.json: gitignored, not in commit

↓ git push

GitHub Pages serves:
  https://your-domain.com
  From /docs on main branch
```

---

## Implementation Guide

### Step 1: Configure Build Tool (Vite)

**File:** `vite.config.js`

```javascript
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // Serve from /src in development
  root: 'src',
  
  // Static assets from /public
  publicDir: '../public',
  
  // Build configuration
  build: {
    // Output to /docs (not root!)
    outDir: '../docs',
    
    // Safe to empty /docs - it's all generated
    emptyOutDir: true,
    
    // Multi-page configuration
    rollupOptions: {
      input: {
        main: 'src/index.html',
        settings: 'src/settings.html',
        // Add more entry points as needed
      }
    },
    
    // Asset naming for cache busting
    assetsDir: 'assets',
    
    // Source maps for debugging
    sourcemap: true
  },
  
  // Development server
  server: {
    port: 3456,
    open: true
  },
  
  // PWA plugin configuration
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      outDir: '../docs',
      manifest: {
        // Read from public/manifest.json
      }
    })
  ]
});
```

### Step 2: Configure Package Scripts

**File:** `package.json`

```json
{
  "scripts": {
    "dev": "vite",
    "prebuild": "node scripts/generate-build-info.js",
    "build": "vite build",
    "postbuild": "node scripts/generate-build-info.js",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "type": "module",
  "devDependencies": {
    "vite": "^5.0.0",
    "vite-plugin-pwa": "^0.17.0",
    "vitest": "^1.0.0"
  }
}
```

### Step 3: Create Build Info Script

**File:** `scripts/generate-build-info.js`

```javascript
#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function generateBuildId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}-${hour}${minute}`;
}

function getPackageVersion() {
    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    return packageJson.version;
}

const version = getPackageVersion();
const buildId = generateBuildId();
const buildDate = new Date().toISOString();
const fullVersion = `${version}+${buildId}`;

const buildInfo = {
    version,
    buildId,
    buildDate,
    fullVersion
};

// Write to root (for hook to copy to /docs)
fs.writeFileSync(
    path.join(__dirname, '..', 'build'),
    fullVersion
);

fs.writeFileSync(
    path.join(__dirname, '..', 'build-info.json'),
    JSON.stringify(buildInfo, null, 2)
);

console.log(`Build info generated: ${fullVersion}`);
```

### Step 4: Create Pre-Commit Hook

**File:** `.git/hooks/pre-commit`

```bash
#!/bin/bash
# Pre-commit hook for PWA with /src → /docs pattern

set -e  # Exit immediately if any command fails

echo "🧪 Pre-commit: Running critical regression tests..."
echo ""

# Run tests (configure based on your test setup)
npm test

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Tests failed! Commit aborted."
    echo "   Fix the failing tests before committing."
    exit 1
fi

echo ""
echo "🔨 Pre-commit: Building /src → /docs..."

# Run the build (quietly to reduce noise)
npm run build --silent > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Commit aborted."
    echo "   Run 'npm run build' to see detailed errors."
    exit 1
fi

# Copy build metadata to /docs for deployment
echo "📋 Pre-commit: Copying build metadata to /docs..."
if [ -f build ]; then
    cp build docs/build
fi
if [ -f build-info.json ]; then
    cp build-info.json docs/build-info.json
fi

# Add HTML warnings (optional but recommended)
if [ -f scripts/add-warnings-to-docs.cjs ]; then
    node scripts/add-warnings-to-docs.cjs > /dev/null 2>&1
fi

# Stage all built files
git add docs/

echo "✅ Pre-commit: Tests passed, /docs built and staged successfully!"
echo ""
exit 0
```

**Make executable:**
```bash
chmod +x .git/hooks/pre-commit
```

### Step 5: Configure Git Ignore

**File:** `.gitignore`

```gitignore
# Dependencies
node_modules/

# Build artifacts at root (gitignored, hook copies to /docs)
/build
/build-info.json
/src/build-info.json

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store

# Test coverage
coverage/

# Logs
*.log
npm-debug.log*
```

**Key point:** Root build files are gitignored, only `/docs/build` and `/docs/build-info.json` are committed.

---

## Protection Strategies

### Layer 1: .gitattributes

**File:** `.gitattributes`

```
# Mark all /docs files as generated
docs/** linguist-generated=true

# Ensure consistent line endings
docs/** text eol=lf
```

**Effect:** GitHub UI shows files as generated, reducing likelihood of direct edits.

### Layer 2: .cursorrules

**File:** `.cursorrules`

```
# Cursor AI Rules for PWA Development

## 🚫 DO NOT EDIT /docs DIRECTORY
**CRITICAL**: The `/docs` directory contains AUTO-GENERATED build output.
- NEVER edit files in `/docs` manually
- NEVER suggest changes to files in `/docs`
- If asked to modify a file in `/docs`, redirect to the corresponding `/src` file
- All source code lives in `/src`

## ✅ CORRECT WORKFLOW
1. Edit source files in `/src`
2. Run `npm run build` to generate `/docs`
3. Test with `npm run preview`
4. Commit changes to both `/src` (source) and `/docs` (built)

## 📁 DIRECTORY STRUCTURE
```
/src/          ← EDIT HERE (source code)
/docs/         ← DO NOT EDIT (auto-generated)
/public/       ← Static assets
```

See QUICK_START.md for complete workflow documentation.
```

**Effect:** AI assistants will avoid editing `/docs` files and guide developers to edit `/src`.

### Layer 3: HTML Comments

**File:** `scripts/add-warnings-to-docs.cjs`

```javascript
const fs = require('fs');
const path = require('path');

const WARNING = `
<!--
╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                                             ║
║  ⚠️  AUTO-GENERATED FILE - DO NOT EDIT MANUALLY! ⚠️                                                         ║
║                                                                                                             ║
║  This file was generated by Vite from source files in /src                                                 ║
║                                                                                                             ║
║  To make changes:                                                                                           ║
║  1. Edit the corresponding file in /src                                                                     ║
║  2. Run: npm run build                                                                                      ║
║  3. The changes will be reflected here automatically                                                        ║
║                                                                                                             ║
║  Editing this file directly will result in:                                                                 ║
║  ❌ Lost changes (file regenerated on next build)                                                           ║
║  ❌ Confusion about which version is correct                                                                ║
║  ❌ Deployment issues                                                                                        ║
║                                                                                                             ║
╚═══════════════════════════════════════════════════════════════════════════════════════════════════════════╝
-->
`.trim();

function addWarningToHtml(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if warning already exists
    if (content.includes('AUTO-GENERATED FILE')) {
        return false;
    }
    
    // Add warning after <!DOCTYPE html> or at the beginning
    const doctypeMatch = content.match(/^(<!DOCTYPE html>\\s*)/i);
    if (doctypeMatch) {
        const newContent = content.replace(
            /^(<!DOCTYPE html>\\s*)/i,
            `$1\\n${WARNING}\\n`
        );
        fs.writeFileSync(filePath, newContent);
        return true;
    } else {
        fs.writeFileSync(filePath, `${WARNING}\\n${content}`);
        return true;
    }
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    let count = 0;
    
    for (const file of files) {
        const fullPath = path.join(dir, file.name);
        
        if (file.isDirectory()) {
            count += processDirectory(fullPath);
        } else if (file.name.endsWith('.html')) {
            if (addWarningToHtml(fullPath)) {
                console.log(`  ✓ Added warning to ${file.name}`);
                count++;
            } else {
                console.log(`  ✓ ${file.name} already has warning`);
            }
        }
    }
    
    return count;
}

const docsDir = path.join(__dirname, '..', 'docs');
console.log('Adding warnings to HTML files in /docs...');
const count = processDirectory(docsDir);
console.log(`\\nDone! Added warnings to ${count} file(s).`);
```

**Effect:** Human developers opening `/docs` HTML files see large, obvious warning.

### Layer 4: Documentation

Create clear, comprehensive documentation:
- `QUICK_START.md` - Simple workflow guide
- `README.md` - Points to full documentation
- This guide - Deep architectural explanation

**Effect:** New developers understand the pattern immediately.

---

## Build Process

### Development Workflow

```bash
# Day-to-day development
npm run dev

# Serves /src directly
# Hot module reload
# No build step needed
# Fast iteration
```

### Production Build

```bash
# Manual build (if needed)
npm run build

# 1. prebuild: Generates build-info.json
# 2. vite build: Bundles /src → /docs
# 3. postbuild: Updates build-info.json
# 4. Result: Fresh /docs ready to deploy
```

### Automated Build (Pre-commit)

```bash
# When you commit
git commit -m "Add feature"

# Pre-commit hook runs automatically:
# 1. npm test (blocks if fails)
# 2. npm run build (blocks if fails)
# 3. cp build docs/build
# 4. cp build-info.json docs/build-info.json
# 5. git add docs/
# 6. Commit proceeds with /docs updated

# Post-commit: git status is clean ✅
```

---

## GitHub Pages Integration

### Configuration

1. Repository Settings → Pages
2. Source: "Deploy from a branch"
3. Branch: `main`
4. Folder: `/docs` ← **Critical**
5. Custom domain (optional): your-domain.com

### Custom Domain Setup

**File:** `/docs/CNAME`

```
your-domain.com
```

**DNS Configuration:**
```
Type: CNAME
Name: your-domain or @
Value: yourusername.github.io
```

### Deployment Flow

```
git push
  ↓
GitHub receives push
  ↓
GitHub Pages builds (1-2 minutes)
  ↓
Site live at:
  - https://yourusername.github.io/repo-name
  - https://your-domain.com (if CNAME configured)
```

**No GitHub Actions needed** - GitHub Pages serves `/docs` directly from `main` branch.

---

## Troubleshooting

### Issue: Working directory not clean after commit

**Symptom:**
```bash
$ git status
modified: build
modified: build-info.json
```

**Cause:** Root build files not gitignored.

**Fix:**
```bash
# Add to .gitignore
echo "/build" >> .gitignore
echo "/build-info.json" >> .gitignore

# Remove from git tracking
git rm --cached build build-info.json
git commit -m "gitignore build artifacts"
```

### Issue: Live site doesn't match latest code

**Symptom:** Pushed changes don't appear on live site.

**Diagnosis:**
```bash
# Check if /docs is up-to-date
git status
git log -1 --stat docs/
```

**Fix:**
```bash
# Rebuild manually
npm run build

# Check what changed
git diff docs/

# Commit if correct
git add docs/
git commit -m "Update /docs"
git push
```

### Issue: Pre-commit hook fails

**Symptom:** Commit blocked with build or test errors.

**Fix:**
```bash
# See detailed errors
npm run build
npm test

# Fix the issues
# Then commit again
```

### Issue: Git operations fail with permission errors

**Symptom:**
```
error: unable to unlink 'docs/index.html': Permission denied
```

**Cause:** Files marked read-only (don't do this!).

**Fix:**
```bash
# Make writable
chmod -R u+w docs/

# Retry git operation
git pull
```

**Prevention:** Don't use filesystem read-only protection - use the 4 layers above instead.

---

## Migration Strategy

### From Mixed Structure to /src → /docs

**If you have an existing PWA with mixed files:**

1. **Backup everything**
   ```bash
   git checkout -b deployment-migration
   ```

2. **Create directory structure**
   ```bash
   mkdir -p src public project-docs
   ```

3. **Move source files**
   ```bash
   # Move HTML to /src
   mv *.html src/
   
   # Move JS/CSS to /src
   mv js src/
   mv css src/
   
   # Move static assets to /public
   mv manifest.json public/
   mv icons public/
   ```

4. **Rescue documentation**
   ```bash
   # If /docs contained project docs
   mv docs project-docs
   mkdir docs
   ```

5. **Configure build**
   - Create `vite.config.js` (see Step 1)
   - Update `package.json` (see Step 2)

6. **Test build**
   ```bash
   npm run build
   # Check /docs is generated correctly
   npm run preview
   # Test at localhost:4173
   ```

7. **Add protections**
   - Create `.gitattributes`
   - Create `.cursorrules`
   - Update `.gitignore`
   - Create pre-commit hook

8. **Commit migration**
   ```bash
   git add -A
   git commit -m "refactor: migrate to /src → /docs pattern"
   ```

9. **Test thoroughly**
   - Clear localStorage
   - Test all features
   - Check mobile
   - Verify PWA install

10. **Deploy**
    ```bash
    git push origin deployment-migration
    # Create PR, review, merge to main
    ```

11. **Update GitHub Pages**
    - Settings → Pages → Folder: `/docs`

**Complete migration guide:** See `MIGRATION_PLAN.md` in this repository.

---

## Success Criteria

Your deployment architecture is correct if:

- ✅ Developers only edit `/src`
- ✅ `npm run dev` shows changes immediately
- ✅ Commits trigger tests + build automatically
- ✅ `git status` clean after commits (no build artifacts)
- ✅ `git push` deploys correctly
- ✅ Live site updates within 2 minutes
- ✅ No one asks "which file is the latest?"
- ✅ No PRs about "missing features" that exist in source

---

## References

- [PWA Development Workflow - Deployment Pattern](./PWA_DEVELOPMENT_WORKFLOW.md#critical-the-src--docs-deployment-pattern)
- [PWA Development Lessons - Source vs Build Confusion](./PWA_DEVELOPMENT_LESSONS.md#critical-source-vs-build-file-confusion-oct-2025)
- [PWA Quick Reference - Deployment Checklist](./PWA_QUICK_REFERENCE.md)
- [Vite Documentation - Build Options](https://vitejs.dev/config/build-options.html)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

---

**Created:** October 3, 2025  
**Based on:** Production deployment of Blockdoku PWA  
**Status:** Production-proven pattern  
**Mandatory:** For all new PWA projects

This pattern saved weeks of development time and prevented countless bugs.  
Implement it from day one.


