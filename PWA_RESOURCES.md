# PWA Resources & References

*Curated collection of PWA learning materials, tools, and examples*

---

## 📋 Table of Contents

1. [Interactive Demos & Testing](#interactive-demos--testing)
2. [Official Documentation](#official-documentation)
3. [Our Documentation](#our-documentation)
4. [Tools & Utilities](#tools--utilities)
5. [Learning Resources](#learning-resources)
6. [Real-World Examples](#real-world-examples)
7. [Community & Support](#community--support)

---

## 🎮 Interactive Demos & Testing

### **[What PWA Can Do Today](https://whatpwacando.today/)** ⭐
**The definitive PWA capabilities showcase**

An interactive PWA that demonstrates what's possible with Progressive Web Apps and which features are supported on your current device.

**Features demonstrated:**
- ✅ Installation & offline support
- ✅ Push notifications & web push
- ✅ File system access & file handling
- ✅ Geolocation & media capture
- ✅ Bluetooth, NFC, payments
- ✅ Background sync & fetch
- ✅ Contact picker, web share
- ✅ Authentication (WebAuthn)
- ✅ AR/VR, wake lock, orientation
- ✅ And 30+ more capabilities

**Why it's essential:**
- 🎯 Test what YOUR device supports
- 🎯 See real implementations of each API
- 🎯 Understand browser compatibility
- 🎯 Get implementation ideas

**Use case:** Before implementing a feature, check if it's supported on your target devices.

---

### **[PWA Builder](https://www.pwabuilder.com/)**
Test, package, and publish your PWA

**Features:**
- ✅ PWA analyzer and report card
- ✅ Generate missing assets (manifest, service worker, icons)
- ✅ Package for app stores (Microsoft Store, Google Play, iOS)
- ✅ Best practices checklist

**Use case:** Validate your PWA meets standards and package for distribution.

---

### **[Lighthouse](https://developers.google.com/web/tools/lighthouse)**
Automated PWA auditing tool

**Built into Chrome DevTools:**
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Run PWA audit

**Checks:**
- ✅ PWA installability
- ✅ Performance metrics
- ✅ Accessibility
- ✅ Best practices
- ✅ SEO

**Use case:** Pre-launch checklist and continuous monitoring.

---

## 📚 Official Documentation

### **[Google Web.dev - Progressive Web Apps](https://web.dev/explore/progressive-web-apps)** ⭐
Google's comprehensive PWA learning collection

**Complete curriculum includes:**
- **Introduction:** What are PWAs? What makes a good PWA?
- **Installation:** Making PWAs installable, custom install experiences
- **User Experience:** App-like feel, progressive enhancement
- **Advanced Topics:** Multi-origin sites, offline UX, app stores
- **Case Studies:** Real business impact (Clipchamp, Gravit Designer, Rakuten, ZDF)

**Special features:**
- ✅ [Learn PWA Course](https://web.dev/learn/pwa/) - Complete structured course
- ✅ Case studies with business metrics (97% growth, 450% retention, 60% conversion)
- ✅ Up-to-date with latest Chrome features
- ✅ Practical implementation guides

**Best for:** Complete learning path from beginner to advanced, real business cases

---

### **[MDN Web Docs - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)**
Comprehensive PWA documentation from Mozilla

**Topics:**
- PWA structure and architecture
- Service worker lifecycle
- Offline functionality
- Installation and distribution
- Best practices

**Best for:** In-depth API references and browser compatibility tables

---

### **[W3C Web App Manifest](https://www.w3.org/TR/appmanifest/)**
Official specification for web app manifests

**Best for:** Understanding manifest.json specification details

---

## 📖 Our Documentation

### **Core Guides**

1. **[PWA Development Lessons](./project-docs/PWA_DEVELOPMENT_LESSONS.md)** - Start here
   - Complete index of all guides
   - Decision tree for which guide to use
   - Real-world case studies

2. **[PWA Quick Reference](./project-docs/PWA_QUICK_REFERENCE.md)** - Fast answers
   - Code snippets ready to copy
   - Common mistakes to avoid
   - Troubleshooting guide

3. **[PWA Mobile UX Guide](./project-docs/PWA_MOBILE_UX_GUIDE.md)** - Mobile-first design
   - Touch event handling
   - Pages vs modals
   - Responsive patterns

4. **[Deployment Architecture](./project-docs/DEPLOYMENT_ARCHITECTURE.md)** - /src → /docs pattern
   - Build automation
   - GitHub Pages setup
   - Protection layers

5. **[PWA Development Workflow](./project-docs/PWA_DEVELOPMENT_WORKFLOW.md)** - Testing & CI/CD
   - Multi-tier testing strategies
   - Pre-commit hooks
   - Local testing environment

6. **[PWA Technical Implementation](./project-docs/PWA_TECHNICAL_IMPLEMENTATION.md)** - Architecture
   - Modular design patterns
   - Service worker strategies
   - State management

7. **[Multi-PWA Port Management](./project-docs/MULTI_PWA_PORT_MANAGEMENT.md)** - Dev server setup
   - Port conflict prevention
   - Management scripts
   - Team workflows

---

## 🛠️ Tools & Utilities

### **Icon Generators**

**[PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)**
```bash
npx pwa-asset-generator [logo] [output-folder]
```
Generates all required PWA icons from a single source image.

**[Favicon.io](https://favicon.io/)**
Online favicon and icon generator.

---

### **Service Worker Generators**

**[Workbox](https://developers.google.com/web/tools/workbox)**
```bash
npm install workbox-webpack-plugin --save-dev
```
Google's service worker library with caching strategies.

**[sw-precache](https://github.com/GoogleChromeLabs/sw-precache)**
Generate a service worker for static assets.

---

### **Testing Tools**

**[Chrome DevTools](chrome://inspect/#devices)**
- Device emulation
- Network throttling
- Service worker debugging
- Application storage inspection

**[Playwright](https://playwright.dev/)**
```bash
npm install @playwright/test
```
E2E testing with PWA support.

**Our setup:** See [PWA_DEVELOPMENT_WORKFLOW.md](./project-docs/PWA_DEVELOPMENT_WORKFLOW.md#local-testing-environment-setup)

---

### **Performance Tools**

**[Web Page Test](https://www.webpagetest.org/)**
Test performance from different locations and devices.

**[PageSpeed Insights](https://pagespeed.web.dev/)**
Google's performance analyzer with actionable recommendations.

---

## 📚 Learning Resources

### **Books**

**[Progressive Web Apps](https://www.manning.com/books/progressive-web-apps)** by Dean Hume
Comprehensive guide to building PWAs.

**[Building Progressive Web Apps](https://www.oreilly.com/library/view/building-progressive-web/9781491961643/)** by Tal Ater
O'Reilly's definitive PWA guide.

---

### **Courses**

**[Learn PWA](https://web.dev/learn/pwa/)** by Google ⭐ **FREE**
Google's official comprehensive PWA course

**Course structure:**
- 22 modules covering everything from basics to advanced
- Progressive enhancement strategies
- Service workers deep dive
- Caching strategies and offline patterns
- Installation and app-like experiences
- Platform-specific features
- Testing and debugging

**Why it's excellent:**
- ✅ Free and official
- ✅ Up-to-date with latest standards
- ✅ Interactive examples
- ✅ From the Chrome team

---

**[Progressive Web Apps (PWAs) - The Complete Guide](https://www.udemy.com/course/progressive-web-app-pwa-the-complete-guide/)** (Udemy)
13-hour comprehensive video course with hands-on projects.

---

### **Blogs & Newsletters**

**[PWA Tips](https://pwa-tips.com/)**
Weekly PWA best practices and tips.

**[web.dev Blog](https://web.dev/blog/)**
Latest web platform updates from Google.

**[Firt.dev](https://firt.dev/)**
Maximiliano Firtman's PWA and mobile web blog.

---

## 🌟 Real-World Examples

### **Showcase Sites**

**[PWA.rocks](https://pwa.rocks/)**
Curated collection of well-built PWAs.

**[Appscope](https://appsco.pe/)**
Directory of Progressive Web Apps.

---

### **Open Source PWAs**

**[Twitter Lite](https://mobile.twitter.com)**
One of the most famous PWA implementations.

**[Starbucks PWA](https://app.starbucks.com/)**
E-commerce PWA with offline ordering.

**[Trivago](https://www.trivago.com/)**
Travel booking PWA.

**Our Examples:**
- **[PWA Template](https://pea.523.life/)** - This project
- **[Giffer](https://giffer.523.life/)** - Video to GIF converter
- Blockdoku, CannonPop, BustAGroove, MealPlanner (documented patterns)

---

### **Case Studies with Business Impact**

From [web.dev PWA case studies](https://web.dev/explore/progressive-web-apps):

**[Clipchamp Video Editor](https://web.dev/case-studies/clipchamp)**
- 97% monthly growth in PWA installs
- Video editing entirely in browser
- Deprecated Electron app in favor of PWA

**[Gravit Designer](https://web.dev/case-studies/gravit-designer)**
- PWA users 2.5x more likely to purchase PRO version
- Vector design tool as PWA
- Better conversion than native app

**[Rakuten 24](https://web.dev/case-studies/rakuten)**
- 450% increase in user retention
- Significant improvement in engagement metrics
- Japanese e-commerce platform

**[JD.ID](https://web.dev/case-studies/jd)**
- 53% improvement in mobile conversion rate
- Caching strategies + installation + push notifications
- Indonesian e-commerce

**[Goibibo](https://web.dev/case-studies/goibibo)**
- 60% improvement in conversions
- Indian travel booking platform
- Focus on performance and offline

**[ZDF Video Platform](https://web.dev/case-studies/zdf)**
- German broadcaster's video PWA
- Offline support + dark mode
- Accessible media player

---

## 💬 Community & Support

### **Forums & Discussion**

**[Stack Overflow - PWA Tag](https://stackoverflow.com/questions/tagged/progressive-web-apps)**
Q&A for specific PWA implementation questions.

**[Reddit - r/PWA](https://www.reddit.com/r/PWA/)**
Community discussions and news.

**[Google Web Developers Discord](https://discord.gg/google-dev-community)**
Live chat with Google DevRel and community.

---

### **GitHub Topics**

**[#progressive-web-app](https://github.com/topics/progressive-web-app)**
Discover PWA projects on GitHub.

**[#pwa](https://github.com/topics/pwa)**
PWA-related repositories.

---

### **Twitter Accounts**

- **[@ChromiumDev](https://twitter.com/ChromiumDev)** - Chrome team updates
- **[@MSEdgeDev](https://twitter.com/MSEdgeDev)** - Edge team
- **[@webkit](https://twitter.com/webkit)** - Safari/WebKit team
- **[@firt](https://twitter.com/firt)** - Maximiliano Firtman (PWA expert)

---

## 🎯 Quick Start Checklist

### **Essential Resources for New PWA Projects**

1. **Before Starting:**
   - [ ] Check [What PWA Can Do Today](https://whatpwacando.today/) for feature support
   - [ ] Take [Learn PWA Course](https://web.dev/learn/pwa/) from Google (free!)
   - [ ] Review [Our PWA Development Lessons](./project-docs/PWA_DEVELOPMENT_LESSONS.md)
   - [ ] Set up [local testing environment](./project-docs/PWA_DEVELOPMENT_WORKFLOW.md#local-testing-environment-setup)

2. **During Development:**
   - [ ] Follow [PWA Quick Reference](./project-docs/PWA_QUICK_REFERENCE.md) patterns
   - [ ] Test with [Lighthouse](https://developers.google.com/web/tools/lighthouse) regularly
   - [ ] Validate manifest with [PWA Builder](https://www.pwabuilder.com/)

3. **Before Launch:**
   - [ ] Run full [Lighthouse audit](https://developers.google.com/web/tools/lighthouse)
   - [ ] Test on real devices (see [testing checklist](./project-docs/PWA_MOBILE_UX_GUIDE.md#mobile-testing-checklist))
   - [ ] Verify offline functionality
   - [ ] Test installation flow

4. **After Launch:**
   - [ ] Monitor with [PageSpeed Insights](https://pagespeed.web.dev/)
   - [ ] Submit to [PWA.rocks](https://pwa.rocks/) for showcase
   - [ ] Share on [Appscope](https://appsco.pe/)

---

## 🔗 Additional Links

### **API References**

- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)

### **Browser Support**

- [Can I Use - PWA](https://caniuse.com/?search=progressive%20web%20app)
- [Is Service Worker Ready?](https://jakearchibald.github.io/isserviceworkerready/)

---

## 📝 Contributing

Have a great PWA resource to add? Submit a PR or open an issue!

**Criteria for inclusion:**
- ✅ Actively maintained
- ✅ High quality content
- ✅ Adds unique value
- ✅ Free or has free tier

---

## 📄 License

This resource list is part of the PWA Template project.  
**Repository:** https://github.com/chasemp/peadoubleueh  
**Live Demo:** https://pea.523.life

---

**Last Updated:** October 3, 2025  
**Maintained By:** Development Team

