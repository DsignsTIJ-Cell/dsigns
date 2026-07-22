#!/bin/bash
# Final keepalive for Next.js on port 3000
# Monitors every 2 seconds and restarts immediately if dead

LOG="/tmp/keepalive.log"
SERVER_LOG="/tmp/next-prod.log"

> "$LOG"

while true; do
    # Check if port 3000 has a listener
    if ! ss -tlnp | grep -q ":3000 "; then
        echo "[$(date)] Port 3000 not listening, starting server..." >> "$LOG"
        pkill -9 -f "next-server" 2>/dev/null
        sleep 1
        cd /home/z/my-project
        NODE_OPTIONS="--max-old-space-size=128" nohup npx next start -p 3000 > "$SERVER_LOG" 2>&1 &
        echo "[$(date)] Started PID=$!" >> "$LOG"
        sleep 4
    fi
    sleep 2
done
