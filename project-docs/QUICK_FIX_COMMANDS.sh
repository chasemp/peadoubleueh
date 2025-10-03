#!/bin/bash
# Quick commands to commit and deploy the PWA fixes

echo "🚀 PWA Deployment Fix - Quick Commit & Deploy"
echo ""
echo "Current directory: $(pwd)"
echo ""

# Change to repo root
cd /Users/cpettet/git/chasemp/peadoubleueh

echo "📋 Step 1: Staging all changes..."
git add docs/assets/
git add docs/sw.js
git add src/pwa-template/public/assets/
git add src/pwa-template/scripts/generate-placeholder-icons.js
git add docs/build
git add docs/build-info.json
git add src/pwa-template/vite.config.js
git add DEPLOYMENT_FIX_SUMMARY.md
git add QUICK_FIX_COMMANDS.sh

echo "✅ Files staged!"
echo ""
echo "📋 Step 2: Review staged changes..."
git status

echo ""
echo "📝 Ready to commit? Run:"
echo ""
echo "  git commit -m \"fix: Add missing icons and service worker for PWA deployment"
echo ""
echo "  - Add placeholder icons for all required sizes"
echo "  - Configure Vite to copy service worker to docs"
echo "  - Fix output directory paths in vite.config.js"
echo "  - Add icon generation script for future updates"
echo ""
echo "  Fixes service worker registration and PWA installation issues\""
echo ""
echo "Then push with:"
echo "  git push origin main"
echo ""

