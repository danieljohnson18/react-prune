#!/bin/bash

# scripts/core/check_package_sizes.sh

ROOT_DIR="${1:-.}"

echo "⚖️  Checking package sizes (top 15 heaviest)..."

if [ ! -d "$ROOT_DIR/node_modules" ]; then
    echo "⚠️  node_modules not found. Cannot calculate sizes. Please install dependencies."
    exit 0
fi

# We use du (disk usage) to get sizes of folders in node_modules.
# We explicitly check folders that match dependencies in package.json to be cleaner,
# OR we just check immediate children of node_modules to find the biggest ones (simplest and most useful for bloat).

# Approach: List usage of all folders in node_modules, sort by size, take top 15.
# du -h -d 1 node_modules | sort -h -r | head -n 15

# Note: -d 1 is for depth 1. -h is human readable. sort -h sorts human readable (e.g. 1G > 500M).
# Mac stats might differ slightly but modern du/sort often support -h. 
# If separate sort is needed we can try standard bytes.

if [[ "$OSTYPE" == "darwin"* ]]; then
    # MacOS 'du' uses -d for depth. 'sort' supports -h.
    du -h -d 1 "$ROOT_DIR/node_modules" 2>/dev/null | sort -h -r | head -n 15 | awk '{print $1, $2}' | sed "s|$ROOT_DIR/node_modules/||"
else
    # Linux (GNU)
    du -h --max-depth=1 "$ROOT_DIR/node_modules" 2>/dev/null | sort -h -r | head -n 15 | awk '{print $1, $2}' | sed "s|$ROOT_DIR/node_modules/||"
fi
