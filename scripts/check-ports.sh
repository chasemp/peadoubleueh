#!/bin/bash

# Check PWA dev server ports
# Shows which ports are in use and which are available

echo "🔍 Checking PWA dev server ports..."
echo ""

check_port() {
  local port=$1
  local name=$2
  if lsof -i :$port > /dev/null 2>&1; then
    local pid=$(lsof -ti :$port)
    local cmd=$(ps -p $pid -o comm= 2>/dev/null || echo "unknown")
    echo "✅ Port $port ($name) - RUNNING (PID: $pid, cmd: $cmd)"
  else
    echo "⚪ Port $port ($name) - Available"
  fi
}

# Check registered PWA ports
check_port 3456 "pwa-template"
check_port 3001 "blockdoku"
check_port 3002 "cannonpop"
check_port 3003 "bustagroove"
check_port 3004 "mealplanner"
check_port 3005 "[available]"

echo ""
echo "💡 Tip: Use './scripts/kill-port.sh <port>' to free a port"

