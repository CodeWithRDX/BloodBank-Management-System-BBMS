#!/usr/bin/env bash
# ==============================================================================
# Nagios Plugin: check_mem.sh
# Purpose: Calculate Memory Utilization % from /proc/meminfo on Linux
# Returns:
#   0: OK
#   1: WARNING
#   2: CRITICAL
#   3: UNKNOWN
# ==============================================================================

set -o pipefail

WARN=80
CRIT=90

print_usage() {
    echo "Usage: $0 -w <warn_pct> -c <crit_pct>"
    echo "Example: $0 -w 80 -c 90"
}

while getopts "w:c:h" opt; do
    case "$opt" in
        w) WARN="$OPTARG" ;;
        c) CRIT="$OPTARG" ;;
        h|*) print_usage; exit 3 ;;
    esac
done

if [ ! -r /proc/meminfo ]; then
    echo "UNKNOWN: /proc/meminfo is not readable"
    exit 3
fi

MEM_TOTAL=$(grep MemTotal /proc/meminfo | awk '{print $2}')
MEM_AVAIL=$(grep MemAvailable /proc/meminfo | awk '{print $2}')

if [ -z "$MEM_TOTAL" ] || [ -z "$MEM_AVAIL" ] || [ "$MEM_TOTAL" -eq 0 ]; then
    echo "UNKNOWN: Failed to read memory metrics"
    exit 3
fi

MEM_USED=$(( MEM_TOTAL - MEM_AVAIL ))
PCT_USED=$(( (MEM_USED * 100) / MEM_TOTAL ))

TOTAL_MB=$(( MEM_TOTAL / 1024 ))
USED_MB=$(( MEM_USED / 1024 ))
AVAIL_MB=$(( MEM_AVAIL / 1024 ))

PERFDATA="used=${USED_MB}MB;${WARN}%;${CRIT}%;0;${TOTAL_MB} total=${TOTAL_MB}MB"

if [ "$PCT_USED" -ge "$CRIT" ]; then
    echo "CRITICAL: Memory utilization at ${PCT_USED}% (${USED_MB}MB/${TOTAL_MB}MB used) | $PERFDATA"
    exit 2
elif [ "$PCT_USED" -ge "$WARN" ]; then
    echo "WARNING: Memory utilization at ${PCT_USED}% (${USED_MB}MB/${TOTAL_MB}MB used) | $PERFDATA"
    exit 1
else
    echo "OK: Memory utilization at ${PCT_USED}% (${USED_MB}MB/${TOTAL_MB}MB used, ${AVAIL_MB}MB free) | $PERFDATA"
    exit 0
fi

