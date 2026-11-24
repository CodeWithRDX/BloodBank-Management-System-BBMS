#!/usr/bin/env bash
# ==============================================================================
# Nagios Plugin: check_mongo.sh
# Purpose: Check availability and connectivity of local MongoDB daemon
# Returns:
#   0: OK
#   2: CRITICAL
#   3: UNKNOWN
# ==============================================================================

PORT="${1:-27017}"
HOST="127.0.0.1"

# 1. First check if systemd service is active (if running as systemd service)
if command -v systemctl >/dev/null 2>&1; then
    SERVICE_STATE=$(systemctl is-active mongod 2>/dev/null || true)
    if [ "$SERVICE_STATE" != "active" ]; then
        # Check if process exists directly
        if ! pgrep -x "mongod" >/dev/null 2>&1; then
            echo "CRITICAL: mongod service is not running (systemctl status: $SERVICE_STATE)"
            exit 2
        fi
    fi
fi

# 2. Check if MongoDB is listening on local port 27017
if command -v nc >/dev/null 2>&1; then
    if nc -z -w 3 "$HOST" "$PORT" >/dev/null 2>&1; then
        echo "OK: MongoDB daemon is active and listening on ${HOST}:${PORT}"
        exit 0
    else
        echo "CRITICAL: Unable to connect to MongoDB on ${HOST}:${PORT}"
        exit 2
    fi
elif command -v timeout >/dev/null 2>&1; then
    if timeout 3 bash -c "</dev/tcp/$HOST/$PORT" >/dev/null 2>&1; then
        echo "OK: MongoDB daemon is active and listening on ${HOST}:${PORT}"
        exit 0
    else
        echo "CRITICAL: Unable to reach MongoDB on ${HOST}:${PORT}"
        exit 2
    fi
else
    # Fallback to checking socket / proc
    if pgrep -x "mongod" >/dev/null 2>&1; then
        echo "OK: mongod process is running (PID: $(pgrep -x mongod | head -n1))"
        exit 0
    else
        echo "CRITICAL: mongod process is not found"
        exit 2
    fi
fi

