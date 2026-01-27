# Contributing to react-prune

We use [Changesets](https://github.com/changesets/changesets) to manage versioning and releases. This ensures that every new feature or fix is properly documented and versioned (Semantic Versioning).

## 🚀 Release Workflow for New Features

When you are adding a new feature, follow this structure:

1.  **Develop your feature**: Make your code changes.
2.  **Create a Changeset**: Before you commit, run:
    ```bash
    npx changeset
    ```
3.  **Select Impact**:
    - Select `react-prune`.
    - Choose **minor** for new features (e.g., `1.1.0`).
    - Choose **patch** for bug fixes (e.g., `1.0.1`).
    - Choose **major** for breaking changes (e.g., `2.0.0`).
4.  **Describe Changes**: Write a short summary of the feature. This will appear in the `CHANGELOG.md`.

### What happens next?

1.  **Push to GitHub**: Commit the `.changeset/` file along with your code.
2.  **Versioning PR**: Use the `main` branch. GitHub Actions will automatically detect the changeset and create/update a **"Version Packages"** Pull Request.
    - This PR accumulates multiple changesets if they happen in quick succession.
3.  **Release**: When a maintainer merges the **"Version Packages"** PR:
    - The package/version is bumped in `package.json`.
    - `CHANGELOG.md` is updated.
    - A git tag (e.g., `v1.1.0`) is created.
    - The package is automatically published to NPM.

## 🛠 Development

- **Install**: `npm install`
- **Build**: `npm run build`
- **Test**: `node dist/cli.js analyze`
