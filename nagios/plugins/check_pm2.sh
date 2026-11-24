#!/usr/bin/env bash
# ==============================================================================
# Nagios Plugin: check_pm2.sh
# Purpose: Check status of a PM2 process
# Arguments:
#   $1: PM2 process name (default: bbms-backend)
# Returns:
#   0: OK (online)
#   2: CRITICAL (stopped / errored / missing)
#   3: UNKNOWN
# ==============================================================================

PROCESS_NAME="${1:-bbms-backend}"

# Locate pm2 executable
PM2_BIN=$(which pm2 2>/dev/null || echo "/usr/bin/pm2" || echo "/usr/local/bin/pm2")

if [ ! -x "$PM2_BIN" ]; then
    # Try looking in nvm or root paths
    if [ -x "/usr/lib/node_modules/pm2/bin/pm2" ]; then
        PM2_BIN="/usr/lib/node_modules/pm2/bin/pm2"
    else
        echo "UNKNOWN: pm2 command not found on system"
        exit 3
    fi
fi

# Run pm2 jlist to inspect process state as JSON
PM2_JSON=$( $PM2_BIN jlist 2>/dev/null )

if [ -z "$PM2_JSON" ] || [ "$PM2_JSON" = "[]" ]; then
    echo "CRITICAL: No PM2 processes are currently running"
    exit 2
fi

# Check status of the specified process name using python/jq/grep
STATUS=$(echo "$PM2_JSON" | grep -o "\"name\":\"$PROCESS_NAME\".*\"status\":\"[^\"]*\"" | head -n1 | grep -o "\"status\":\"[^\"]*\"" | cut -d':' -f2 | tr -d '"')

if [ -z "$STATUS" ]; then
    echo "CRITICAL: PM2 process '$PROCESS_NAME' was not found"
    exit 2
fi

if [ "$STATUS" = "online" ]; then
    echo "OK: PM2 process '$PROCESS_NAME' is online"
    exit 0
else
    echo "CRITICAL: PM2 process '$PROCESS_NAME' status is '$STATUS'"
    exit 2
fi

