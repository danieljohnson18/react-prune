#!/bin/bash

# scripts/prune-check.sh

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔍 Running Project Health Check...${NC}\n"

# 1. Run Depcheck
echo -e "${YELLOW}📦 Checking for unused dependencies (depcheck)...${NC}"
if ! command -v depcheck &> /dev/null; then
    echo "depcheck could not be found, running via npx..."
    DEPCHECK_CMD="npx depcheck"
else
    DEPCHECK_CMD="depcheck"
fi

# Run depcheck and capture output
# We use --json to parse, or just run it plainly for the user to see
$DEPCHECK_CMD --skip-missing=true --ignores="react-prune" .

DEPCHECK_EXIT_CODE=$?

if [ $DEPCHECK_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies look clean!${NC}\n"
else
    echo -e "${RED}❌ Unused dependencies found.${NC}\n"
fi

# 2. Run React Prune
echo -e "${YELLOW}✂️  Running React Prune Analysis...${NC}"

# Assuming we are running this from the root of the repo where react-prune is being developed
# We can use the local built CLI or npx react-prune if installed
# For this dev context, we'll try to use the local build
if [ -f "./dist/cli.js" ]; then
    echo "Using local build..."
    node ./dist/cli.js analyze
else
    echo "Local build not found, running build..."
    npm run build --silent
    node ./dist/cli.js analyze
fi

PRUNE_EXIT_CODE=$?

echo -e "\n${YELLOW}📊 Summary:${NC}"
if [ $DEPCHECK_EXIT_CODE -eq 0 ] && [ $PRUNE_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}🎉 Project is clean!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Issues detected. Please review above output.${NC}"
    exit 1
fi
