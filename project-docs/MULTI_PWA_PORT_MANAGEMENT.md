# Multi-PWA Port Management Guide

> **Problem:** Running multiple PWAs locally causes port conflicts. Each project fights for the same port, dev servers crash, and you waste time troubleshooting.

> **Solution:** Establish a port registry, configure projects properly, and use tooling to manage multiple dev servers.

---

## 📋 Table of Contents

1. [The Problem](#the-problem)
2. [Port Assignment Strategy](#port-assignment-strategy)
3. [Vite Configuration](#vite-configuration)
4. [Port Registry](#port-registry)
5. [Management Scripts](#management-scripts)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## The Problem

### What Happens Without Port Management

```bash
# Terminal 1
cd blockdoku && npm run dev
# ✅ Running on http://localhost:3000

# Terminal 2
cd cannonpop && npm run dev
# ❌ ERROR: Port 3000 is already in use
# OR
# ✅ Running on http://localhost:3001 (auto-incremented)
```

**Issues:**
- 🔴 Hard to remember which project is on which port
- 🔴 URLs change based on startup order
- 🔴 Service workers cache wrong ports
- 🔴 Browser testing gets confusing
- 🔴 Development workflow is fragile

---

## Port Assignment Strategy

### **Recommended: Fixed Port Per Project**

Each PWA gets a unique, memorable port that never changes.

```javascript
// Port Registry Convention
3000 - pwa-template      (Base template)
3001 - blockdoku         (First game)
3002 - cannonpop         (Second game)
3003 - bustagroove       (Third game)
3004 - mealplanner       (Utility app)
3005 - [next-project]
// ... continue sequentially
```

**Benefits:**
- ✅ Consistent URLs across sessions
- ✅ Easy to remember and bookmark
- ✅ Service workers register correctly
- ✅ Multiple projects can run simultaneously
- ✅ No startup order dependencies

### **Alternative: Port Range by Project Type**

```javascript
// Games: 3000-3099
3000 - blockdoku
3001 - cannonpop
3002 - bustagroove

// Utilities: 3100-3199
3100 - mealplanner
3101 - task-tracker

// Marketing/Landing: 3200-3299
3200 - portfolio-site
3201 - product-landing
```

---

## Vite Configuration

### **Option 1: Strict Port (Recommended)**

**Fail fast if port is taken** - forces you to be explicit about running projects.

```javascript
// vite.config.js
export default defineConfig({
  server: {
    port: 3001,           // Unique port for THIS project
    host: '0.0.0.0',      // Allow network access
    strictPort: true,     // FAIL if port is taken (don't auto-increment)
    open: false           // Don't auto-open browser (optional)
  }
})
```

**When it fails:**
```bash
$ npm run dev
Error: Port 3001 is already in use
```

✅ **Good!** You know immediately another instance is running.

### **Option 2: Auto-Increment Port**

**Find next available port** - convenient but can cause confusion.

```javascript
// vite.config.js
export default defineConfig({
  server: {
    port: 3001,           // Preferred port
    host: '0.0.0.0',
    strictPort: false,    // Allow auto-increment
    open: false
  }
})
```

**When port is taken:**
```bash
$ npm run dev
Port 3001 is in use, trying 3002...
✅ Running on http://localhost:3002
```

⚠️ **Caution:** URL changes based on startup order.

### **Recommended: Use strictPort: true**

Forces explicit management and prevents confusion.

---

## Port Registry

### **Create a Central Registry**

**`/docs/PORT_REGISTRY.md` (or keep in main project)**

```markdown
# PWA Port Registry

| Port | Project       | Status | Deployed URL              |
|------|---------------|--------|---------------------------|
| 3000 | pwa-template  | Active | https://pea.523.life      |
| 3001 | blockdoku     | Active | https://blockdoku.io      |
| 3002 | cannonpop     | Active | https://cannonpop.io      |
| 3003 | bustagroove   | Active | https://bustagroove.io    |
| 3004 | mealplanner   | Active | https://mealplanner.dev   |
| 3005 | [reserved]    | -      | -                         |

**Next Available Port:** 3005

## Quick Start Commands

```bash
# PWA Template
cd ~/git/peadoubleueh && npm run dev      # → http://localhost:3000

# Blockdoku
cd ~/git/blockdoku && npm run dev         # → http://localhost:3001

# CannonPop
cd ~/git/cannonpop && npm run dev         # → http://localhost:3002
```
```

### **Alternative: Shell Script Registry**

**`scripts/pwa-ports.sh`**

```bash
#!/bin/bash

# PWA Port Registry
declare -A PWA_PORTS=(
  ["pwa-template"]="3000"
  ["blockdoku"]="3001"
  ["cannonpop"]="3002"
  ["bustagroove"]="3003"
  ["mealplanner"]="3004"
)

# Usage: get_port PROJECT_NAME
get_port() {
  local project=$1
  echo "${PWA_PORTS[$project]}"
}

# Export for use in other scripts
export -f get_port
export PWA_PORTS
```

---

## Management Scripts

### **1. Check Running Dev Servers**

**`scripts/check-ports.sh`**

```bash
#!/bin/bash

echo "🔍 Checking PWA dev server ports..."
echo ""

check_port() {
  local port=$1
  local name=$2
  if lsof -i :$port > /dev/null 2>&1; then
    local pid=$(lsof -ti :$port)
    echo "✅ Port $port ($name) - RUNNING (PID: $pid)"
  else
    echo "⚪ Port $port ($name) - Available"
  fi
}

check_port 3000 "pwa-template"
check_port 3001 "blockdoku"
check_port 3002 "cannonpop"
check_port 3003 "bustagroove"
check_port 3004 "mealplanner"
```

**Usage:**
```bash
$ ./scripts/check-ports.sh
🔍 Checking PWA dev server ports...

✅ Port 3000 (pwa-template) - RUNNING (PID: 12345)
✅ Port 3001 (blockdoku) - RUNNING (PID: 12346)
⚪ Port 3002 (cannonpop) - Available
⚪ Port 3003 (bustagroove) - Available
⚪ Port 3004 (mealplanner) - Available
```

### **2. Kill Specific Port**

**`scripts/kill-port.sh`**

```bash
#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: ./kill-port.sh <port>"
  echo "Example: ./kill-port.sh 3001"
  exit 1
fi

PORT=$1

if lsof -i :$PORT > /dev/null 2>&1; then
  PID=$(lsof -ti :$PORT)
  echo "🔪 Killing process on port $PORT (PID: $PID)"
  kill -9 $PID
  echo "✅ Port $PORT is now free"
else
  echo "⚪ Port $PORT is not in use"
fi
```

**Usage:**
```bash
$ ./scripts/kill-port.sh 3001
🔪 Killing process on port 3001 (PID: 12346)
✅ Port 3001 is now free
```

### **3. Start Multiple Projects**

**`scripts/start-all-pwas.sh`**

```bash
#!/bin/bash

# Start all PWA dev servers in background
start_pwa() {
  local name=$1
  local path=$2
  local port=$3
  
  echo "🚀 Starting $name on port $port..."
  cd "$path" && npm run dev > "/tmp/$name-dev.log" 2>&1 &
  echo "   Logs: tail -f /tmp/$name-dev.log"
}

# Start each PWA
start_pwa "pwa-template" "$HOME/git/peadoubleueh" 3000
start_pwa "blockdoku" "$HOME/git/blockdoku" 3001
start_pwa "cannonpop" "$HOME/git/cannonpop" 3002

echo ""
echo "✅ All PWAs started!"
echo "📊 Check status: ./scripts/check-ports.sh"
```

### **4. Package.json Helper Script**

**Add to each project's `package.json`:**

```json
{
  "scripts": {
    "dev": "vite",
    "dev:check": "lsof -i :3001 || echo 'Port 3001 is free'",
    "dev:kill": "lsof -ti :3001 | xargs kill -9 || echo 'No process on 3001'",
    "dev:force": "npm run dev:kill && npm run dev"
  }
}
```

**Usage:**
```bash
npm run dev:check    # Is my port in use?
npm run dev:kill     # Kill whatever's on my port
npm run dev:force    # Kill and restart
```

---

## Best Practices

### ✅ **Do This**

1. **Assign Unique Ports**
   ```javascript
   // Each project gets ONE port, documented in vite.config.js
   server: { port: 3001, strictPort: true }
   ```

2. **Document Port Assignments**
   - Keep a registry (markdown or script)
   - Update when adding new projects
   - Share with team members

3. **Use strictPort: true**
   - Fails fast when port conflicts occur
   - Forces explicit management
   - Prevents confusion

4. **Add Port to Project README**
   ```markdown
   ## Development
   
   ```bash
   npm run dev  # → http://localhost:3001
   ```
   
   **Assigned Port:** 3001 (see PORT_REGISTRY.md)
   ```

5. **Check Ports Before Starting**
   ```bash
   ./scripts/check-ports.sh
   ```

### ❌ **Don't Do This**

1. **Don't rely on auto-increment ports**
   - URLs change based on startup order
   - Service workers get confused
   - Hard to remember which project is where

2. **Don't share ports between projects**
   - Even if you "only run one at a time"
   - You WILL forget and waste time debugging

3. **Don't use common ports**
   - Avoid 3000 (default for many tools)
   - Avoid 8000, 8080 (common servers)
   - Avoid 4200 (Angular), 5173 (Vite default)

4. **Don't change ports frequently**
   - Service workers cache the port
   - Bookmarks break
   - Team members get confused

---

## Troubleshooting

### **Port Already in Use**

```bash
Error: Port 3001 is already in use
```

**Solution 1: Check what's running**
```bash
lsof -i :3001
# Shows process using port 3001
```

**Solution 2: Kill the process**
```bash
lsof -ti :3001 | xargs kill -9
# OR
npm run dev:kill  # If you added the script
```

**Solution 3: Use different port temporarily**
```bash
PORT=3009 npm run dev
```

### **Service Worker Caching Wrong Port**

**Problem:** Opened project on wrong port, now service worker is confused.

**Solution:**
```bash
# In browser DevTools → Application → Service Workers
# Click "Unregister"

# OR use Chrome Beta for testing (isolated environment)
```

### **Can't Remember Which Port**

**Solution:** Add to project's `package.json`:
```json
{
  "config": {
    "port": "3001"
  },
  "scripts": {
    "dev": "vite",
    "port": "echo 'This project runs on port 3001'"
  }
}
```

```bash
npm run port
# → This project runs on port 3001
```

### **Multiple Terminals, Lost Track**

**Solution:** Use tmux or screen with labeled windows:
```bash
# ~/.tmux.conf
set -g status-left "#S (PWA:#W)"

# Start sessions
tmux new -s pwa-template
tmux new -s blockdoku
tmux new -s cannonpop
```

---

## Quick Reference

### **Port Assignment Pattern**

```
3000 → pwa-template
3001 → blockdoku
3002 → cannonpop
3003 → bustagroove
3004 → mealplanner
3005 → [next project]
```

### **Essential Commands**

```bash
# Check what's running
lsof -i :3001

# Kill a port
lsof -ti :3001 | xargs kill -9

# Start on specific port
PORT=3009 npm run dev

# Check all PWA ports
./scripts/check-ports.sh
```

### **Vite Config Template**

```javascript
export default defineConfig({
  server: {
    port: 3001,        // ← CHANGE THIS for each project
    host: '0.0.0.0',
    strictPort: true   // ← Fail fast on conflicts
  }
})
```

---

## See Also

- [PWA Quick Reference](./PWA_QUICK_REFERENCE.md) - Development patterns
- [PWA Development Workflow](./PWA_DEVELOPMENT_WORKFLOW.md) - Testing strategies
- [Deployment Architecture](./DEPLOYMENT_ARCHITECTURE.md) - Build and deploy

---

**This guide is part of the PWA Template project documentation.**  
**Repository:** https://github.com/chasemp/peadoubleueh  
**Live Demo:** https://pea.523.life

