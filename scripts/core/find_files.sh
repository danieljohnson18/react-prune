#!/bin/bash

# scripts/core/find_files.sh

# Finds all relevant source files in the project, excluding ignored directories.
# Arguments:
#   $1: Root directory (optional, defaults to current dir)

ROOT_DIR="${1:-.}"

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
