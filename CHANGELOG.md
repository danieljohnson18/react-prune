# react-prune

## 2.0.6

### Patch Changes

- docs: add Code of Conduct and Issue Templates.
- docs: add Pull Request template.
- docs: add SECURITY.md policy.

## 2.0.5

### Patch Changes

- docs: add LICENSE file.

## 2.0.4

### Patch Changes

- docs: update README to reflect v2 bash architecture and features.

## 2.0.3

### Patch Changes

- refactor: remove legacy `src` folder and unused dependencies (cleanup).
- ecd7a70: fix: ensure CLI works when installed globally by correctly resolving symlink paths to scripts.

## 2.0.1

### Patch Changes

- feat: add package size check to `analyze` command (reports disk usage of top dependencies).
- feat: add `--version` / `-v` flag to CLI.

## 2.0.0

### Major Changes

- refactor!: complete rewrite of CLI using Bash scripts for better performance and simplicity.
  feat: add `find` command to locate component/function usage with file sizes.
  feat: improved false positive detection for Next.js and configuration files.

## 1.3.0

### Minor Changes

- feat: add unused dependency detection via depcheck
  feat: add file size estimation in find command
  feat: add scripts/prune-check.sh for CI/CD

## 1.2.2

### Patch Changes

- 320b3a2: Fix: Ensure `--json` option works correctly in CLI and outputs valid JSON by handling circular references.
  Fix: Add silent mode to analyzer for clean JSON output.

## 1.2.1

### Patch Changes

- ebd9c7b: refactor: restructured analyzer and added unit tests

## 1.2.0

### Minor Changes

- aca51e8: feat: added detection for unused exports in source files

## 1.1.1

### Patch Changes

- a3f68a7: fix: improved import resolution for path aliases (e.g. `components/*`) and non-relative local imports

## 1.1.0

### Minor Changes

- feat: added CLI usage dashboard with size estimation
  perf: switched to lighter dependencies (picocolors, fast-glob) and enabled minification
  fix: improved unused file heuristics to ignore config files
