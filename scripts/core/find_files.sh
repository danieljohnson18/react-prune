#!/bin/bash

# scripts/core/find_files.sh

# Finds all relevant source files in the project, excluding ignored directories.
# Arguments:
#   $1: Root directory (optional, defaults to current dir)

ROOT_DIR="${1:-.}"


# Check if git is available and if we are in a git repository
if command -v git >/dev/null 2>&1 && git -C "$ROOT_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    # Use git ls-files to respect .gitignore
    # --cached: tracked files
    # --others: untracked files
    # --exclude-standard: respect .gitignore
    git -C "$ROOT_DIR" ls-files --cached --others --exclude-standard | \
    grep -E "\.(js|jsx|ts|tsx)$" | \
    grep -vE "(\.d\.ts|\.config\.(js|ts))$" | \
    while read -r file; do
        # git ls-files returns paths relative to ROOT_DIR (or git root).
        # We need to prepend ROOT_DIR if it's not "."
        if [ "$ROOT_DIR" != "." ]; then
             echo "$ROOT_DIR/$file"
        else
             echo "$file"
        fi
    done
else
    # Fallback to find
    find "$ROOT_DIR" \
        -type f \
        \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) \
        -not -path "*/node_modules/*" \
        -not -path "*/dist/*" \
        -not -path "*/build/*" \
        -not -path "*/.next/*" \
        -not -path "*/coverage/*" \
        -not -path "*/.git/*" \
        -not -name "*.d.ts" \
        -not -name "*.config.js" \
        -not -name "*.config.ts"
fi
