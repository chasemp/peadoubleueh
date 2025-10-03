import { defineConfig } from 'vite'
import { resolve, dirname } from 'path'
import { copyFileSync, cpSync } from 'fs'
import { fileURLToPath } from 'url'

// ES modules don't have __dirname, so we create it
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * BUILD SYSTEM (DEPLOYMENT MODEL):
 *
 * Source → Build → Deploy
 * /src   → /docs → GitHub Pages
 *
 * Development:
 * - root: 'src'                      → dev server serves from /src
 * - Run: npm run dev → http://localhost:3000
 *
 * Production Build:
 * - build.outDir: '../docs'          → builds to /docs directory
 * - build.emptyOutDir: true          → safe to clear /docs (only contains built files)
 * - base: './'                       → enables relative paths for GitHub Pages
 * - Run: npm run build → generates /docs
 *
 * Deployment:
 * - GitHub Pages serves from /docs directory on main branch
 * - /docs contains ONLY generated files (never edit directly!)
 * - Pre-commit hook automatically builds to /docs before commit
 * - See ./project-docs/DEPLOYMENT_ARCHITECTURE.md for complete workflow
 *
 * ⚠️  CRITICAL: Never edit files in /docs manually - they are auto-generated!
 */

// Plugin to copy service worker to output root
function copyServiceWorker() {
  return {
    name: 'copy-service-worker',
    closeBundle: async () => {
      const swSource = resolve(__dirname, 'src/sw.js')
      const swDest = resolve(__dirname, 'docs/sw.js')
      try {
        copyFileSync(swSource, swDest)
        console.log('✅ Service worker copied to output directory')
      } catch (error) {
        console.error('❌ Failed to copy service worker:', error)
      }
    }
  }
}

// Plugin to copy project documentation to output
function copyProjectDocs() {
  return {
    name: 'copy-project-docs',
    closeBundle: async () => {
      const docsSource = resolve(__dirname, 'project-docs')
      const docsDest = resolve(__dirname, 'docs/project-docs')
      try {
        cpSync(docsSource, docsDest, { recursive: true })
        console.log('✅ Project documentation copied to output directory')
      } catch (error) {
        console.error('❌ Failed to copy project docs:', error)
      }
    }
  }
}

export default defineConfig({
  // Serve app files from `src/` during development
  root: 'src',
  // Static files (CNAME, manifest, icons) that should be copied as-is
  publicDir: '../public',
  // Use relative base to support GitHub Pages deployment
  base: './',
  build: {
    // Output into /docs directory at repository root for GitHub Pages deployment
    // Note: Relative to 'root' (src/), so ../docs = repo root /docs
    outDir: '../docs',
    // Safe to empty /docs since it only contains built files
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html')
      }
    }
  },
  plugins: [
    copyServiceWorker(),
    copyProjectDocs()
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true
  }
})

