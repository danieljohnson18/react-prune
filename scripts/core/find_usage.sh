#!/bin/bash

# scripts/core/find_usage.sh

TERM="$1"
ROOT_DIR="${2:-.}"
FIND_SCRIPT="${0%/*}/find_files.sh"

if [ -z "$TERM" ]; then
    echo "Usage: react-prune find <ComponentOrFunction> [RootDir]"
    exit 1
fi

echo "🔎 Searching for usage of '${TERM}'..."

FILES=$($FIND_SCRIPT "$ROOT_DIR")
TOTAL_COUNT=0

# Temporary file to store results
RESULTS_FILE=$(mktemp)

for file in $FILES; do
    # Grep for the term, print line number (-n). 
    # Exclude the definition if possible? Hard in bash without better context, 
    # but we can try to exclude "export const searchTerm =" etc if we wanted, 
    # but simplest is just showing all occurrences and letting user judge.
    
    # We use grep with line numbers.
    MATCHES=$(grep -n "\b${TERM}\b" "$file")
    
    if [ ! -z "$MATCHES" ]; then
        # Check file size
        if [[ "$OSTYPE" == "darwin"* ]]; then
             FILE_SIZE=$(stat -f%z "$file")
        else
             FILE_SIZE=$(stat -c%s "$file")
        fi
        
        # Format size human readable (basic logic)
        if [ "$FILE_SIZE" -lt 1024 ]; then
            SIZE_STR="${FILE_SIZE} B"
        else
            SIZE_STR="$((FILE_SIZE / 1024)) KB"
        fi
        
        # Process each match
        while IFS= read -r line; do
            # Use | as delimiter to avoid conflict with / in paths
            echo "$line" | sed "s|^|${file}: |" | sed "s|$| [${SIZE_STR}]|" >> "$RESULTS_FILE"
            TOTAL_COUNT=$((TOTAL_COUNT + 1))
        done <<< "$MATCHES"
    fi
done

if [ "$TOTAL_COUNT" -eq 0 ]; then
    echo "❌ No usage found for '${TERM}'."
else
    echo "✅ Found ${TOTAL_COUNT} occurrences:"
    echo ""
    cat "$RESULTS_FILE"
    echo ""
    echo "Total: ${TOTAL_COUNT} times"
fi

rm "$RESULTS_FILE"
