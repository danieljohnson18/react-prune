# react-prune ✂️

[![npm version](https://img.shields.io/npm/v/react-prune)](https://www.npmjs.com/package/react-prune)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Static analysis for identifying unused files and package usage in React-based codebases.**

`react-prune` is a lightweight CLI tool that analyzes your React, Next.js, and React Native projects to surface **unused local files**, **unused exports**, and **dependency bloat**.

v2.0 Re-written entirely in **Bash** for speed and simplicity.

---

## 🚀 Features

- **🔎 Component Usage Detection**
  Find where any component or function is used, including line numbers and file sizes.

- **📦 Package Size & Usage Analysis**
  Checks **disk size** of dependencies in `node_modules` to spot heavy packages.

- **🚫 Unused Dependency Detection**
  Leverages `depcheck` to identify dependencies in `package.json` that are completely unused.

- **🧹 Unused File & Export Detection**
  Identifies local source files and exports that are never imported anywhere in the project.

---

## 📦 Installation

Install globally or as a dev dependency:

```bash
npm install -g react-prune
# OR
npm install -D react-prune
```

Also compatible with `yarn` and `pnpm`.

Or run once via `npx`:

```bash
npx react-prune analyze
```

---

## 🛠 Usage

Run from the **root of your project**.

### 1. Analyze the project

Runs a full health check: unused deps, package sizes, unused files, and unused exports.

```bash
react-prune analyze
```

_Note: This runs a sequence of bash scripts optimized for Next.js/React projects._

### 2. Find Component Usage

Search for a component, hook, or function to see exactly where it is used and how much it weighs.

```bash
react-prune find <Term>
```

**Example:**

```bash
react-prune find Button
```

**Output:**

```text
🔎 Searching for usage of 'Button'...
✅ Found 5 occurrences:

src/app/page.tsx: 10: <Button>Click me</Button> [5 KB]
src/components/ui/button.tsx: 12: export { Button } [2 KB]

Total: 5 times
```

---

## 📊 Example Output (Analyze)

```text
🚀 Starting React Prune Analysis...

📦 Checking for unused dependencies...
Unused dependencies
* framer-motion

⚖️  Checking package sizes (top 15 heaviest)...
4.2M lodash
1.1M framer-motion
312K react

🔍 Checking for unused files...
⚠️  Unused file: src/components/OldButton.tsx
⚠️  Unused file: src/utils/deprecated.ts
found 2 unused files.

🔎 Checking for unused exports (heuristic)...
⚠️  Unused export: useOldHook in src/hooks/useMetrics.ts
found 1 unused exports.
```

---

## ⚙️ How It Works (v2 Bash Architecture)

The tool is now a collection of focused Bash scripts for maximum performance on Unix-based systems (macOS/Linux).

1.  **`check_deps.sh`**: Wraps `depcheck` to find unused NPM packages.
2.  **`check_package_sizes.sh`**: Uses `du` to calculate `node_modules` folder sizes.
3.  **`check_unused_files.sh`**: Uses `find` and `grep` to detect unreferenced files (ignoring Next.js pages/layouts).
4.  **`check_unused_exports.sh`**: Uses `grep` to find exported names that don't appear in import statements.

---

## ⚠️ Limitations

- **Platform**: Requires a Unix-like environment (macOS, Linux, WSL).
- **Heuristic Analysis**: Since it uses `grep`/regex instead of AST parsing (for speed), extremely complex import aliasing might be missed, but false positives are minimized for standard React/Next.js patterns.

---

## 🤝 Contributing

```bash
git clone https://github.com/danieljohnson18/react-prune.git
cd react-prune
npm install
npm test
```

To test locally:

```bash
./bin/react-prune analyze
```

---

## 📄 License

MIT © [Daniel Arikawe](https://github.com/danieljohnson18)
