# Migration Plan: Blockdoku → peadoubleueh

**Date:** October 3, 2025  
**Goal:** Centralize PWA best practices and update template with production-proven deployment model

---

## 📋 Phase 1: Analyze Current State

### Blockdoku (Source)
- ✅ Production-proven `/src` → `/docs` workflow
- ✅ Pre-commit hook with tests + auto-build
- ✅ Build metadata strategy (gitignored root, committed /docs)
- ✅ 4 layers of protection (.gitattributes, .cursorrules, HTML comments, docs)
- ✅ Comprehensive documentation

### peadoubleueh (Target)
- ✅ Has PWA guides (workflow, lessons, UX, technical, quick ref)
- ✅ Has template in `src/pwa-template/`
- ❌ Template doesn't use `/src` → `/docs` pattern
- ❌ No pre-commit hook
- ❌ No protection layers
- ❌ Missing deployment workflow lessons

---

## 📋 Phase 2: Documentation Migration

### A. Update PWA_DEVELOPMENT_WORKFLOW.md
Add new section: **"Project Setup & Deployment: The /src → /docs Pattern"**

**Content to add:**
- Complete explanation of source/build separation
- Why building to root is problematic
- Build metadata strategy
- Pre-commit hook pattern
- Protection layers
- GitHub Pages configuration
- From: `blockdoku_pwa/DEPLOYMENT_FINAL.md`

### B. Update PWA_DEVELOPMENT_LESSONS.md  
Add new section: **"Critical Architectural Lessons"**

**Content to add:**
- Source vs Build File Confusion (most destructive issue)
- Root causes and symptoms
- Complete solution with rationale
- Impact analysis
- Prevention for future projects
- From: `blockdoku_pwa/PWA_LESSONS_LEARNED.md` (new deployment section)

### C. Create New Doc: DEPLOYMENT_ARCHITECTURE.md
**Purpose:** Deep dive into deployment architecture

**Content:**
- Source/build separation philosophy
- Directory structure rationale
- Build process automation
- Metadata management
- Protection strategies
- Troubleshooting guide
- From: `blockdoku_pwa/DEPLOYMENT_MIGRATION_SUMMARY.md` + parts of `DEPLOYMENT_FINAL.md`

### D. Update PWA_QUICK_REFERENCE.md
Add quick reference section: **"Deployment Checklist"**

**Content to add:**
- 5-minute setup
- Daily workflow commands
- Troubleshooting quick fixes
- From: `blockdoku_pwa/QUICK_START.md`

---

## 📋 Phase 3: Template Update

### Current Template Structure:
```
src/pwa-template/
├── index.html          # Everything at root
├── js/
├── css/
├── manifest.json
├── sw.js
└── package.json
```

### New Template Structure:
```
pwa-template/
├── src/                      # ✅ SOURCE CODE
│   ├── index.html
│   ├── js/
│   ├── css/
│   └── assets/
├── docs/                     # ✅ BUILD OUTPUT (gitignored initially)
│   └── .gitkeep
├── public/                   # ✅ STATIC ASSETS
│   ├── manifest.json
│   ├── icons/
│   └── favicon.ico
├── .git/hooks/
│   └── pre-commit           # ✅ AUTO-BUILD + TEST
├── .gitignore               # ✅ IGNORE BUILD ARTIFACTS
├── .gitattributes           # ✅ MARK /docs AS GENERATED
├── .cursorrules             # ✅ WARN ABOUT /docs
├── vite.config.js           # ✅ BUILD TO /docs
├── package.json             # ✅ PROPER SCRIPTS
├── QUICK_START.md           # ✅ LOCAL REFERENCE
└── README.md                # ✅ POINTS TO peadoubleueh DOCS
```

### Files to Create/Update:

#### 1. vite.config.js (NEW)
```javascript
// Based on blockdoku's proven config
export default {
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../docs',
    emptyOutDir: true,
    rollupOptions: { /* ... */ }
  },
  server: { port: 3000 }
}
```

#### 2. .git/hooks/pre-commit (NEW)
```bash
#!/bin/bash
# Run tests
npm test
# Build /src → /docs
npm run build
# Copy build metadata
cp build docs/build
cp build-info.json docs/build-info.json
# Stage
git add docs/
```

#### 3. .gitignore (UPDATE)
```
node_modules/
/build
/build-info.json
/src/build-info.json
.DS_Store
```

#### 4. .gitattributes (NEW)
```
docs/** linguist-generated=true
docs/** text eol=lf
```

#### 5. .cursorrules (NEW)
```
# CRITICAL: DO NOT EDIT /docs - AUTO-GENERATED
# Edit /src instead, then run 'npm run build'
```

#### 6. package.json (UPDATE)
Add scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  }
}
```

#### 7. QUICK_START.md (NEW)
```markdown
# PWA Template Quick Start
1. Edit /src
2. Test: npm run dev
3. Commit (auto-builds)
4. Push

See https://github.com/chasemp/peadoubleueh for complete docs
```

#### 8. scripts/generate-build-info.js (NEW)
Copy from blockdoku

---

## 📋 Phase 4: Blockdoku Cleanup

### Keep in Blockdoku:
- `QUICK_START.md` (updated with link to peadoubleueh)
- `project-docs/` (project-specific documentation)
- `.cursorrules` (local)
- `.gitattributes` (local)

### Update in Blockdoku:
#### QUICK_START.md Header:
```markdown
# Blockdoku Quick Start

**For complete PWA deployment best practices, see:**
https://github.com/chasemp/peadoubleueh

This is a local quick reference for Blockdoku-specific workflow.
```

### Remove from Blockdoku:
- `DEPLOYMENT_FINAL.md` (moved to peadoubleueh)
- `DEPLOYMENT_MIGRATION_SUMMARY.md` (moved to peadoubleueh)
- `EXTRACTED_FROM_PRS.md` (temporary, no longer needed)
- `REVIEW_CHECKLIST.md` (temporary, no longer needed)
- `FINAL_STATUS.md` (temporary, no longer needed)
- `PR_CLOSURE_PLAN.md` (temporary, no longer needed)
- `pr-comments/` (temporary, no longer needed)

### Update PWA_LESSONS_LEARNED.md:
Add at top:
```markdown
**Note:** General PWA deployment best practices have been moved to:
https://github.com/chasemp/peadoubleueh

This file now contains Blockdoku-specific lessons (theme management, navigation, game logic).
```

---

## 📋 Phase 5: Testing & Validation

### Test Template:
1. Copy template to new directory
2. Run `npm install`
3. Run `npm run dev` → verify works
4. Make change to `/src/index.html`
5. Commit → verify hook builds `/docs`
6. Check `/docs` has files
7. Run `npm run preview` → verify works
8. Push to GitHub
9. Configure GitHub Pages → /docs
10. Verify live site works

### Test Documentation:
1. Read through all updated docs
2. Verify links work
3. Verify code examples are accurate
4. Test commands in guides
5. Verify cross-references

---

## 📋 Execution Order

1. ✅ **Create this migration plan**
2. ⏳ **Phase 2: Update peadoubleueh docs** (A, B, C, D)
3. ⏳ **Phase 3: Restructure template**
4. ⏳ **Phase 4: Clean up blockdoku**
5. ⏳ **Phase 5: Test everything**
6. ⏳ **Commit and push peadoubleueh**
7. ⏳ **Commit and push blockdoku cleanup**
8. ✅ **Done!**

---

## 🎯 Success Criteria

### peadoubleueh:
- ✅ All docs updated with deployment lessons
- ✅ Template uses `/src` → `/docs` pattern
- ✅ Template has working pre-commit hook
- ✅ Template has all protection layers
- ✅ Template README points to main docs

### blockdoku:
- ✅ Clean repository (only necessary files)
- ✅ QUICK_START.md points to peadoubleueh
- ✅ No duplicate documentation
- ✅ Still fully functional

### Both:
- ✅ No broken links
- ✅ All commands work
- ✅ Clear cross-references
- ✅ Ready for other PWA projects

---

**Created:** October 3, 2025  
**Status:** Ready for execution  
**Estimated Time:** 2-3 hours


