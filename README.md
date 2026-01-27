# react-prune ✂️

[![npm version](https://img.shields.io/npm/v/react-prune)](https://www.npmjs.com/package/react-prune)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm downloads](https://img.shields.io/npm/dm/react-prune)](https://www.npmjs.com/package/react-prune)

> **Static analysis for identifying unused files and package usage in React-based codebases.**

`react-prune` is a lightweight CLI tool that analyzes your React, Next.js, and React Native projects to surface **unused local files** and **package import usage**, helping you reduce dead code and dependency bloat.

---

## 🚀 Features

- **📦 Package Usage Analysis**
  Counts how often each external npm package is imported across your codebase.

- **⚖️ Optional Package Size Estimation**
  Estimates package sizes from `node_modules` to highlight heavy dependencies.

- **🧹 Unused File Detection**
  Identifies local source files that are never imported anywhere in the project.

- **⚛️ React Ecosystem Support**
  Works with React, Next.js (Pages & App Router), and React Native projects.

- **📊 CLI-Friendly Output**
  Displays results in readable tables or as structured JSON for automation.

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

Run from the **root of your project**:

```bash
react-prune
```

### Options

| Option        | Description                                |
| ------------- | ------------------------------------------ |
| `--json`      | Output the report as JSON                  |
| `--no-size`   | Skip package size calculation              |
| `--limit <n>` | Limit displayed package rows (default: 50) |

### Example

```bash
react-prune --limit 20
```

---

## 📊 Example Output

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
```

---

## ⚙️ How It Works

1. **File Discovery**
   Recursively scans `.js`, `.jsx`, `.ts`, and `.tsx` files (excluding `node_modules`, `.next`, `dist`, etc.).

2. **AST Parsing**
   Uses `ts-morph` to parse TypeScript/JavaScript ASTs for accurate import analysis.

3. **Dependency Resolution**
   Differentiates between local file imports and external package imports.

4. **Static Usage Mapping**
   Tracks which files and packages are actually referenced in the project.

---

## ⚠️ Limitations (Important)

- This is **static analysis** — dynamic imports and runtime usage may not be detected.
- Files referenced only via tooling configuration (e.g. Storybook, tests, build scripts) may appear unused.
- Package size estimates are approximate and based on disk size, not bundle size.

---

## 🤝 Contributing

Contributions are welcome.

```bash
git clone https://github.com/danieljohnson18/react-prune.git
cd react-prune
npm install
npm run dev
```

Test locally:

```bash
node dist/cli.js
```

---

## 📄 License

MIT © [Daniel Arikawe](https://github.com/danieljohnson18)

---
