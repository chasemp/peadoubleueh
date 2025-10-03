# PWA Template - Best Practices

A production-ready Progressive Web App template demonstrating best practices learned from multiple PWA projects.

🌐 **Live Demo:** https://pea.523.life/

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → Opens at http://localhost:3000

# Build for production
npm run build
# → Outputs to /docs for GitHub Pages deployment

# Preview production build
npm run preview
```

---

## 📁 Project Structure

```
peadoubleueh/
├── src/              # Source code (processed by Vite)
│   ├── index.html    # Main HTML entry
│   ├── js/           # JavaScript modules
│   ├── css/          # Stylesheets
│   ├── sw.js         # Service worker
│   └── assets/       # Source images
│
├── public/           # Static assets (copied as-is)
│   ├── CNAME         # Custom domain
│   ├── manifest.json # PWA manifest
│   └── assets/       # Icons and favicons
│
├── docs/             # Build output (auto-generated)
│   └── [Never edit manually!]
│
├── scripts/          # Build scripts
├── project-docs/     # Architecture documentation
└── vite.config.js    # Build configuration
```

---

## ✨ Features

### Core PWA Features
- ✅ **Offline Support** - Service worker with intelligent caching
- ✅ **Installable** - Add to home screen on mobile/desktop
- ✅ **Responsive** - Mobile-first design
- ✅ **Fast** - Optimized loading and caching strategies

### Advanced Features
- 🔄 **Cache Busting** - Smart update detection
- 🎨 **Theme Support** - Light/dark mode with system detection
- 🔔 **Notifications** - Web push notification ready
- 📊 **Performance Monitoring** - Built-in metrics tracking
- 💾 **Storage Management** - IndexedDB/localStorage abstraction

---

## 🛠️ Development

### File Organization
- **Edit `/src`** - All source code (HTML, JS, CSS)
- **Edit `/public`** - Static assets that don't need processing
- **Never edit `/docs`** - Auto-generated on build

### Build Process
Following the `/src → /docs` deployment pattern:

1. **Development:** Edit files in `/src` and `/public`
2. **Build:** Run `npm run build` (outputs to `/docs`)
3. **Deploy:** Commit and push (GitHub Pages serves from `/docs`)

### Architecture Documentation
See `project-docs/` for comprehensive guides:
- `DEPLOYMENT_ARCHITECTURE.md` - Build system deep dive
- `PWA_DEVELOPMENT_WORKFLOW.md` - Best practices
- `PWA_QUICK_REFERENCE.md` - Quick tips and patterns

---

## 📦 Deployment

### GitHub Pages (Automatic)
1. Push to `main` branch
2. GitHub Pages deploys `/docs` automatically
3. Live at https://pea.523.life/ (1-2 minutes)

### Manual Build
```bash
npm run build
git add docs/
git commit -m "build: Update production build"
git push origin main
```

---

## 🎯 Key Components

### JavaScript Modules
- `PWAApp.js` - Main application controller
- `ServiceWorkerManager.js` - SW lifecycle management
- `CacheBustingManager.js` - Update detection
- `ThemeManager.js` - Dark/light theme handling
- `NotificationManager.js` - Push notifications
- `PerformanceMonitor.js` - Performance tracking
- `StorageManager.js` - Data persistence

### Service Worker Features
- Cache-first strategy for static assets
- Network-first for API requests
- Stale-while-revalidate for dynamic content
- Background sync support
- Push notification handling

---

## 🔧 Configuration

### Custom Domain
Edit `public/CNAME`:
```
your-domain.com
```

### PWA Manifest
Edit `public/manifest.json` for app metadata:
- Name, description, colors
- Icons (add to `public/assets/`)
- Display mode, orientation

### Build Settings
Edit `vite.config.js` for:
- Build output paths
- Asset optimization
- Plugin configuration

---

## 📱 Icons

Replace placeholder icons in `public/assets/`:
- Use https://realfavicongenerator.net/
- Upload your 512x512 logo
- Download generated icon pack
- Replace files and rebuild

Required sizes:
- 16x16, 32x32 (favicon)
- 72x72, 96x96, 128x128, 144x144, 152x152
- 192x192, 384x384, 512x512 (PWA)
- Maskable icons: 192x192, 512x512

---

## 🧪 Testing

### Local Testing
```bash
npm run dev        # Development mode
npm run build      # Production build
npm run preview    # Test production build locally
```

### PWA Testing
1. Build and preview production version
2. Test offline functionality (DevTools → Network → Offline)
3. Test installation (browser install prompt)
4. Check service worker registration (DevTools → Application)

---

## 📚 Learn More

- **Architecture:** `project-docs/DEPLOYMENT_ARCHITECTURE.md`
- **Workflow:** `project-docs/PWA_DEVELOPMENT_WORKFLOW.md`
- **Lessons Learned:** `project-docs/PWA_DEVELOPMENT_LESSONS.md`
- **Quick Reference:** `project-docs/PWA_QUICK_REFERENCE.md`

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🤝 Contributing

This is a template project demonstrating PWA best practices. Feel free to use it as a starting point for your own PWAs!

---

**Built with ❤️ following real-world lessons from production PWA deployments**
