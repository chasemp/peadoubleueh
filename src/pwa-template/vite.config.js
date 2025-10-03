import { defineConfig } from 'vite'
import { resolve } from 'path'

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
 * - See ../../DEPLOYMENT_ARCHITECTURE.md for complete workflow
 *
 * ⚠️  CRITICAL: Never edit files in /docs manually - they are auto-generated!
 */

export default defineConfig({
  // Serve app files from `src/` during development
  root: 'src',
  // Use relative base to support GitHub Pages deployment
  base: './',
  build: {
    // Output into /docs directory at repository root for GitHub Pages deployment
    // Note: Relative to 'root' (src/pwa-template/src/), so ../../../docs = repo root /docs
    outDir: '../../../docs',
    // Safe to empty /docs since it only contains built files
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html')
      }
    }
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true
  }
})

