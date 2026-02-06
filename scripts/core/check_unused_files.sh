#!/bin/bash

# scripts/core/check_unused_files.sh

ROOT_DIR="${1:-.}"
INTERACTIVE="${2:-false}"
FIND_SCRIPT="${0%/*}/find_files.sh"

echo "🔍 Checking for unused files..."

FILES=$($FIND_SCRIPT "$ROOT_DIR")
UNUSED_COUNT=0

for file in $FILES; do
    BASENAME=$(basename "$file")
    
    # Skip common config files
    if [[ "$BASENAME" =~ \.config\.(js|ts|mjs|cjs)$ ]]; then
        continue
    fi
     
    # Skip Next.js App Router conventions
    if [[ "$file" == *"app/"* ]] || [[ "$file" == *"pages/"* ]]; then
        if [[ "$BASENAME" =~ ^(page|layout|loading|error|not-found|template|route|middleware|default|global-error)\.(tsx|ts|js|jsx)$ ]]; then
            continue
        fi
    fi
    
    # Skip middleware at root
    if [[ "$BASENAME" == "middleware.ts" ]] || [[ "$BASENAME" == "middleware.js" ]]; then
        continue
    fi

    NAME_WITHOUT_EXT="${BASENAME%.*}"
    
    # Grep for the filename (without extension) in all files
    # We exclude the file itself from the search
    USAGE_COUNT=$(grep -r --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
        --exclude-dir="node_modules" --exclude-dir=".git" --exclude-dir="dist" --exclude-dir="build" \
        "$NAME_WITHOUT_EXT" "$ROOT_DIR" | grep -v "$file" | wc -l)


    if [ "$USAGE_COUNT" -eq 0 ]; then
        # Heuristic: if file is index.ts, check if parent folder is imported
        if [[ "$BASENAME" == "index.ts" ]] || [[ "$BASENAME" == "index.tsx" ]] || [[ "$BASENAME" == "index.js" ]]; then
            PARENT_DIR=$(basename "$(dirname "$file")")
            USAGE_COUNT=$(grep -r --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
             --exclude-dir="node_modules" --exclude-dir=".git" --exclude-dir="dist" --exclude-dir="build" \
             "$PARENT_DIR" "$ROOT_DIR" | grep -v "$file" | wc -l)
             
             if [ "$USAGE_COUNT" -eq 0 ]; then
                 echo "⚠️  Unused file: $file"
                 UNUSED_COUNT=$((UNUSED_COUNT + 1))
                 if [ "$INTERACTIVE" == "true" ]; then
                    read -p "❓ Delete this file? (y/N) " -n 1 -r
                    echo
                    if [[ $REPLY =~ ^[Yy]$ ]]; then
                        rm "$file"
                        echo "🗑️  Deleted $file"
                    fi
                 fi
             fi
        else
            echo "⚠️  Unused file: $file"
            UNUSED_COUNT=$((UNUSED_COUNT + 1))
            if [ "$INTERACTIVE" == "true" ]; then
                read -p "❓ Delete this file? (y/N) " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    rm "$file"
                    echo "🗑️  Deleted $file"
                fi
            fi
        fi
    fi
done

if [ "$UNUSED_COUNT" -eq 0 ]; then
    echo "✅ No unused files found!"
    exit 0
else
    echo "found $UNUSED_COUNT unused files."
    exit 1
fi
