#!/bin/bash

# scripts/core/check_deps.sh

echo "📦 Checking for unused dependencies..."

if ! command -v depcheck &> /dev/null; then
    DEPCHECK_CMD="npx depcheck"
else
    DEPCHECK_CMD="depcheck"
fi

# Run depcheck outputting JSON for parsing if needed, but for now human readable is fine for CLI
# Using --skip-missing to avoid erroring on missing peers etc.
$DEPCHECK_CMD --skip-missing=true --ignores="react-prune" .
