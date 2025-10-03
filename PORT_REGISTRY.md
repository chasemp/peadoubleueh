# PWA Port Registry

> **Purpose:** Central registry of development server ports for all PWA projects to prevent conflicts.

## Active Projects

| Port | Project       | Status | Repository                          | Deployed URL              |
|------|---------------|--------|-------------------------------------|---------------------------|
| 3456 | pwa-template  | Active | chasemp/peadoubleueh                | https://pea.523.life      |
| 3001 | blockdoku     | Active | [add-repo]                          | [add-url]                 |
| 3002 | cannonpop     | Active | [add-repo]                          | [add-url]                 |
| 3003 | bustagroove   | Active | [add-repo]                          | [add-url]                 |
| 3004 | mealplanner   | Active | [add-repo]                          | [add-url]                 |
| 3005 | Giffer/Pipkin | Active | chasemp/Giffer                      | https://giffer.523.life   |
| 3006 | [reserved]    | -      | -                                   | -                         |

**Next Available Port:** 3006

---

## Quick Start Commands

```bash
# PWA Template
cd ~/git/chasemp/peadoubleueh && npm run dev      # → http://localhost:3456

# Blockdoku
cd ~/git/blockdoku && npm run dev                 # → http://localhost:3001

# CannonPop  
cd ~/git/cannonpop && npm run dev                 # → http://localhost:3002

# Giffer (Pipkin)
cd ~/git/chasemp/Giffer && npm run dev            # → http://localhost:3005
```

---

## Management Scripts

```bash
# Check which ports are in use
./scripts/check-ports.sh

# Kill a specific port
./scripts/kill-port.sh 3456

# Check port status
lsof -i :3456
```

---

## Port Assignment Rules

1. **Sequential Assignment** - Assign ports sequentially starting from 3456 (pwa-template)
2. **Fixed Per Project** - Each project keeps its port forever (no reassignment)
3. **Update Registry** - Always update this file when adding a new project
4. **Configure Vite** - Set `server.port` in `vite.config.js` to match registry
5. **Use strictPort** - Set `server.strictPort: true` to fail fast on conflicts

---

## Vite Configuration Template

When creating a new PWA, update `vite.config.js`:

```javascript
export default defineConfig({
  server: {
    port: 3456,        // ← GET FROM REGISTRY (update for each project)
    host: '0.0.0.0',
    strictPort: true   // ← Fail fast if port is taken
  }
})
```

---

## See Also

- [Multi-PWA Port Management Guide](./project-docs/MULTI_PWA_PORT_MANAGEMENT.md) - Complete guide
- [PWA Quick Reference](./project-docs/PWA_QUICK_REFERENCE.md) - Development patterns

---

**Last Updated:** October 3, 2025  
**Maintained By:** Development Team

