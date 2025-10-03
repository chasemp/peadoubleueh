#!/bin/bash

# Kill process using a specific port
# Usage: ./kill-port.sh <port>

if [ -z "$1" ]; then
  echo "❌ Error: No port specified"
  echo ""
  echo "Usage: ./kill-port.sh <port>"
  echo "Example: ./kill-port.sh 3456"
  echo ""
  echo "Common PWA ports:"
  echo "  3456 - pwa-template"
  echo "  3001 - blockdoku"
  echo "  3002 - cannonpop"
  exit 1
fi

PORT=$1

if lsof -i :$PORT > /dev/null 2>&1; then
  PID=$(lsof -ti :$PORT)
  CMD=$(ps -p $PID -o comm= 2>/dev/null || echo "unknown")
  echo "🔪 Killing process on port $PORT (PID: $PID, cmd: $CMD)"
  kill -9 $PID
  echo "✅ Port $PORT is now free"
else
  echo "⚪ Port $PORT is not in use"
fi

