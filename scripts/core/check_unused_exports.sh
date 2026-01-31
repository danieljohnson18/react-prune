#!/bin/bash

# scripts/core/check_unused_exports.sh

ROOT_DIR="${1:-.}"
FIND_SCRIPT="${0%/*}/find_files.sh"

echo "🔎 Checking for unused exports (heuristic)..."

FILES=$($FIND_SCRIPT "$ROOT_DIR")
UNUSED_COUNT=0

for file in $FILES; do
    # 1. Extract exports
    # Matches: export const|function|class|let|var|type|interface Name ...
    # Exclude 'default' from regex capture immediately
    EXPORTS=$(grep -E "^export (const|function|class|let|var|type|interface) " "$file" | sed -E 's/^export (const|function|class|let|var|type|interface) ([a-zA-Z0-9_]+).*/\2/')
    
    for exp in $EXPORTS; do
        # Ignore common false positives
        if [[ "$exp" == "default" ]] || [[ "$exp" == "metadata" ]] || [[ "$exp" == "generateMetadata" ]] || [[ "$exp" == "viewport" ]]; then
            continue
        fi
        
        # Ignore Next.js API route handlers
        if [[ "$exp" == "GET" ]] || [[ "$exp" == "POST" ]] || [[ "$exp" == "PUT" ]] || [[ "$exp" == "DELETE" ]] || [[ "$exp" == "PATCH" ]] || [[ "$exp" == "HEAD" ]] || [[ "$exp" == "OPTIONS" ]]; then
            continue
        fi

        usage=$(grep -r --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
            --exclude-dir="node_modules" --exclude-dir=".git" --exclude-dir="dist" --exclude-dir="build" \
            "\b$exp\b" "$ROOT_DIR" | grep -v "$file" | wc -l)
            
        if [ "$usage" -eq 0 ]; then
             echo "⚠️  Unused export: $exp in $file"
             UNUSED_COUNT=$((UNUSED_COUNT + 1))
        fi
    done
done

if [ "$UNUSED_COUNT" -eq 0 ]; then
    echo "✅ No unused exports found!"
else
    echo "found $UNUSED_COUNT unused exports."
fi
