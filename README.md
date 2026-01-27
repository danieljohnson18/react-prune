# react-prune ✂️

[![npm version](https://img.shields.io/npm/v/react-prune)](https://www.npmjs.com/package/react-prune)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm downloads](https://img.shields.io/npm/dm/react-prune)](https://www.npmjs.com/package/react-prune)

> **Monitor usage of packages and component imports across your React, Next.js, and React Native apps.**

`react-prune` is a powerful CLI tool designed to help you maintain a healthy codebase by identifying unused files, analyzing package usage, and estimating dependency sizes.

## 🚀 Features

- **📦 Package Analysis**: Scans your codebase to count how many times each npm package is imported.
- **⚖️ Size Estimation**: Estimates the size of your used packages directly from `node_modules` to help you identify heavy dependencies.
- **🧹 Dead Code Detection**: Identifies local component files that are _never_ imported, helping you prune dead code.
- **🔍 Unused Exports**: Detects named exports that are defined but never used in other files.
- **⚛️ Framework Agnostic**: Works seamlessly with React, Next.js (Pages & App Router), and React Native.
- **📊 Visual Dashboard**: Provides a beautiful, easy-to-read command-line dashboard using ASCII tables.

## 📦 Installation

To save `react-prune` to your `package.json` (recommended as a Dev Dependency):

### Using npm

```bash
npm install -D react-prune
```

### Using yarn

```bash
yarn add -D react-prune
```

### Using pnpm

```bash
pnpm add -D react-prune
```

You can also run it one-off using `npx`:

```bash
npx react-prune analyze
```

## 🛠 Usage

Navigate to the root of your project and run:

```bash
react-prune analyze
```

The tool will scan your project (ignoring `node_modules`, `dist`, `.next`, etc.) and output a report.

### Example Output

```text
╭─────────────────────────╮
│                         │
│   📦 Package Usage      │
│   Report                │
│                         │
╰─────────────────────────╯

┌────────────────────────────────────────┬───────────────┬───────────────┐
│ Package Name                           │ Usage Count   │ Est. Size     │
├────────────────────────────────────────┼───────────────┼───────────────┤
│ react                                  │ 142           │ 312 KB        │
├────────────────────────────────────────┼───────────────┼───────────────┤
│ lodash                                 │ 5             │ 4.2 MB        │
├────────────────────────────────────────┼───────────────┼───────────────┤
│ framer-motion                          │ 23            │ 1.1 MB        │
└────────────────────────────────────────┴───────────────┴───────────────┘

╭─────────────────────────╮
│                         │
│   ⚠️  Potential         │
│   Unused Files          │
│                         │
╰─────────────────────────╯

┌────────────────────────────────────────────────────────────────────────────────┐
│ File Path                                                                      │
├────────────────────────────────────────────────────────────────────────────────┤
│ src/components/OldButton.tsx                                                   │
├────────────────────────────────────────────────────────────────────────────────┤
│ src/utils/deprecated-helper.ts                                                 │
└────────────────────────────────────────────────────────────────────────────────┘

 ╭─────────────────────────╮
 │                         │
 │   ⚠️  Potential         │
 │   Unused Exports        │
 │                         │
 ╰─────────────────────────╯

 ┌────────────────────────────────────────┬────────────────────────────────────────┐
 │ File                                   │ Unused Exports                         │
 ├────────────────────────────────────────┼────────────────────────────────────────┤
 │ src/hooks/useMetrics.ts                │ useOldMetric                           │
 ├────────────────────────────────────────┼────────────────────────────────────────┤
 │ src/utils/formatters.ts                │ formatCurrency                         │
 └────────────────────────────────────────┴────────────────────────────────────────┘
```

## ⚙️ How it Works

1.  **File Scanning**: It uses `glob` to recursively find all `.js`, `.jsx`, `.ts`, and `.tsx` files in your project.
2.  **AST Analysis**: It uses `ts-morph` to parse the Abstract Syntax Tree (AST) of each file. This is far more accurate than Regex as it understands the code structure.
3.  **Import Resolution**: It resolves import paths to physical files on disk to track internal usage.
4.  **Size Calculation**: It looks up the package in your local `node_modules` folder and calculates the total size of the directory to give you an estimate of the impact.

## 🤝 Contributing

Contributions are welcome!

1.  Clone the repository:
    ```bash
    git clone https://github.com/danieljohnson18/react-prune.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the build in watch mode:
    ```bash
    npm run dev
    ```
4.  Test the analyzer on the project itself:
    ```bash
    node dist/cli.js analyze
    ```

## 📄 License

MIT © [Daniel Arikawe](https://github.com/danieljohnson18)
