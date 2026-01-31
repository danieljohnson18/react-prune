# react-prune ✂️

[![npm version](https://img.shields.io/npm/v/react-prune)](https://www.npmjs.com/package/react-prune)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm downloads](https://img.shields.io/npm/dm/react-prune)](https://www.npmjs.com/package/react-prune)

> **Static analysis for identifying unused files and package usage in React-based codebases.**

`react-prune` is a lightweight CLI tool that analyzes your React, Next.js, Vite, and React Native projects to surface **unused local files**, **unused exports**, and **package import usage**, helping you reduce dead code and dependency bloat.

---

## 🚀 Features

- **🔎 Component Usage Detection**
  Find where any component or function is used, including line numbers and file sizes.

- **📦 Package Usage & Size Analysis**
  Counts usage of external packages and checks **disk size** of dependencies in `node_modules` to spot bloat.

- **🚫 Unused Dependency Detection**
  Leverages `depcheck` to identify dependencies in `package.json` that are completely unused.

- **⚖️ Optional Package Size Estimation**
  Estimates package sizes from `node_modules` to highlight heavy dependencies.

- **🧹 Unused File Detection**
  Identifies local source files that are never imported anywhere in the project.

- **📝 Unused Export Detection**
  Finds named exports (functions, components, constants) that are defined but never used.

- **🔍 Export/Component Search**
  Search for a component or function to see **how many times it’s used** and **all file references with line numbers**.

- **📊 CLI-Friendly Output**
  Displays results in readable tables.

---

## 📦 Installation

Install as a dev dependency (recommended):

### npm

```bash
npm install -D react-prune
```

### yarn

```bash
yarn add -D react-prune
```

### pnpm

```bash
pnpm add -D react-prune
```

Or run once via `npx`:

```bash
npx react-prune
```

---

## 🛠 Usage

Run from the **root of your project**.

### Analyze the project

```bash
react-prune analyze
```

#### Options

| Option         | Description                                |
| -------------- | ------------------------------------------ |
| `--json`       | Output the report as JSON                  |
| `--no-size`    | Skip package size calculation              |
| `--no-exports` | Skip unused export analysis                |
| `--limit <n>`  | Limit displayed package rows (default: 50) |

---

## 🔎 Finding Usage

You can check where a specific component or function is used across your codebase.

```bash
react-prune find <Name>
```

Example:

```bash
react-prune find Button
```

Output:

```
🔎 Searching for usage of 'Button'...
✅ Found 5 occurrences:

src/app/page.tsx: 10: <Button>Click me</Button> [5 KB]
src/components/ui/button.tsx: 12: export { Button } [2 KB]

Total: 5 times
```

---

### Check the size of a specific npm package

```bash
react-prune size <packageName>
```

#### Example

```bash
react-prune size react
```

Output:

```
📦 react size: 312 KB
```

If the package is not installed:

```
Package 'some-package' not found in node_modules.
```

---

## 📊 Example Output (Analyze)

```text
╭─────────────────────────╮
│   📦 Package Usage      │
╰─────────────────────────╯

┌────────────────────────┬────────┬──────────┐
│ Package                │ Count  │ Size     │
├────────────────────────┼────────┼──────────┤
│ react                  │ 142    │ 312 KB   │
│ lodash                 │ 5      │ 4.2 MB   │
│ framer-motion          │ 23     │ 1.1 MB   │
└────────────────────────┴────────┴──────────┘

╭─────────────────────────╮
│ ⚠️ Unused Files (2)     │
╰─────────────────────────╯

src/components/OldButton.tsx
src/utils/deprecated-helper.ts

╭─────────────────────────╮
│ ⚠️ Unused Exports (3)   │
╰─────────────────────────╯

src/hooks/useMetrics.ts            useOldMetric
src/utils/formatters.ts            formatCurrency
src/components/OldButton.tsx      OldButton
```

---

## ⚙️ How It Works

1. **File Discovery**
   Recursively scans `.js`, `.jsx`, `.ts`, and `.tsx` files (excluding `node_modules`, `.next`, `dist`, etc.).

2. **AST Parsing**
   Uses `ts-morph` to parse TypeScript/JavaScript ASTs for accurate import/export analysis.

3. **Dependency Resolution**
   Differentiates between local file imports and external package imports.

4. **Static Usage Mapping**
   Tracks which files, exports, and packages are actually referenced in the project.

---

## ⚠️ Limitations

- This is **static analysis** — dynamic imports and runtime usage may not be detected.
- Files referenced only via tooling (e.g., Storybook, tests) may appear unused.
- Package size estimates are **disk-based**, not bundle size.

---

## 🤝 Contributing

```bash
git clone https://github.com/danieljohnson18/react-prune.git
cd react-prune
npm install
npm run dev
```

Test locally:

```bash
node dist/cli.js analyze
node dist/cli.js find Button
node dist/cli.js size react
```

---

## 📄 License

MIT © [Daniel Arikawe](https://github.com/danieljohnson18)

---
