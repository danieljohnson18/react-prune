import { Project, SyntaxKind } from "ts-morph";
import chalk from "chalk";
import { glob } from "glob";
import path from "path";
import fs from "fs";

export interface UsageReport {
  packages: Record<string, { count: number; size: string }>;
  components: Record<string, number>;
  unusedFiles: string[];
}

// Helper to calculate folder size recursively
function getFolderSize(dirPath: string): number {
  let size = 0;
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        size += getFolderSize(filePath);
      } else {
        size += stats.size;
      }
    }
  } catch (e) {
    return 0;
  }
  return size;
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function getPackageSize(rootPath: string, packageName: string): string {
  // Try to find module in node_modules
  // Search in local node_modules first, then maybe recursive?
  // For now simple check in root/node_modules
  const pkgPath = path.join(rootPath, "node_modules", packageName);
  if (fs.existsSync(pkgPath)) {
    const size = getFolderSize(pkgPath);
    return formatBytes(size);
  }
  return "N/A";
}

export async function analyzeProject(rootPath: string): Promise<UsageReport> {
  console.log(chalk.green(`Analyzing project at ${rootPath}`));

  // 1. Find all files
  const files = await glob("**/*.{js,jsx,ts,tsx}", {
    cwd: rootPath,
    ignore: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/coverage/**",
      "**/*.config.{js,ts,cjs,mjs}", // Ignore config files
      "**/.d.ts" // Ignore definition files
    ],
    absolute: true
  });

  console.log(chalk.blue(`Found ${files.length} files to analyze.`));

  // 2. Initialize ts-morph project
  const project = new Project({
    skipAddingFilesFromTsConfig: true
  });

  // Add files to project
  files.forEach((file) => {
    try {
      project.addSourceFileAtPath(file);
    } catch (e) {
      console.warn(chalk.yellow(`Skipping file ${file} due to load error:`), e);
    }
  });

  const packageUsage: Record<string, number> = {};
  const localUsage: Record<string, number> = {};

  // Initialize local usage with 0 for all files to track unused ones
  files.forEach((f) => {
    // Normalize path to be relative and standard for comparison
    const relative = path.relative(rootPath, f);
    localUsage[relative] = 0;
  });

  // 3. Analyze Imports
  for (const sourceFile of project.getSourceFiles()) {
    const imports = sourceFile.getImportDeclarations();

    for (const imp of imports) {
      const moduleSpecifier = imp.getModuleSpecifierValue();

      if (moduleSpecifier.startsWith(".") || moduleSpecifier.startsWith("/")) {
        // Local Import
        try {
          // Resolve the import to a file on disk
          const sourceFilePath = sourceFile.getFilePath();
          const sourceDir = path.dirname(sourceFilePath);

          const resolvedPath = path.resolve(sourceDir, moduleSpecifier);
          // We need to try extensions
          const extensions = [
            "",
            ".ts",
            ".tsx",
            ".js",
            ".jsx",
            "/index.ts",
            "/index.tsx",
            "/index.js",
            "/index.jsx"
          ];

          for (const ext of extensions) {
            const tryPath = resolvedPath + ext;
            const relativeTry = path.relative(rootPath, tryPath);
            if (localUsage.hasOwnProperty(relativeTry)) {
              localUsage[relativeTry]++;
              break;
            }
          }
        } catch (e) {
          // ignore resolution errors
        }
      } else {
        // Package Import
        let packageName = moduleSpecifier;
        if (moduleSpecifier.startsWith("@")) {
          const parts = moduleSpecifier.split("/");
          if (parts.length >= 2) {
            packageName = `${parts[0]}/${parts[1]}`;
          }
        } else {
          const parts = moduleSpecifier.split("/");
          if (parts.length >= 1) {
            packageName = parts[0];
          }
        }

        packageUsage[packageName] = (packageUsage[packageName] || 0) + 1;
      }
    }

    // Check for require() calls (CommonJS)
    const callExpressions = sourceFile.getDescendantsOfKind(
      SyntaxKind.CallExpression
    );
    for (const call of callExpressions) {
      const expression = call.getExpression();
      if (expression.getText() === "require") {
        const args = call.getArguments();
        if (args.length > 0 && args[0].getKind() === SyntaxKind.StringLiteral) {
          const rawArg = args[0].getText().replace(/['"`]/g, "");
          // Simple duplicate logic for MVP (should refactor)
          if (!rawArg.startsWith(".") && !rawArg.startsWith("/")) {
            let pkg = rawArg.startsWith("@")
              ? rawArg.split("/").slice(0, 2).join("/")
              : rawArg.split("/")[0];
            packageUsage[pkg] = (packageUsage[pkg] || 0) + 1;
          }
        }
      }
    }
  }

  // 4. Construct Report Data
  const reportPackages: Record<string, { count: number; size: string }> = {};

  for (const [pkg, count] of Object.entries(packageUsage)) {
    const size = getPackageSize(rootPath, pkg);
    reportPackages[pkg] = { count, size };
  }

  const unused = Object.entries(localUsage)
    .filter(([file, count]) => {
      // Known Entry Points & Framework specifics
      if (
        file.includes("pages/") ||
        file.includes("app/") ||
        file.endsWith("main.tsx") ||
        file.endsWith("index.tsx") ||
        file.endsWith("index.js") ||
        file.endsWith("App.tsx") ||
        file.endsWith("App.js")
      )
        return false;

      // Ignore files in the project root (usually configs, scripts, etc.)
      // We check if the relative path contains a separator. If not, it's in the root.
      const relative = path.relative(rootPath, file);
      if (!relative.includes(path.sep)) {
        return false;
      }
      return count === 0;
    })
    .map(([file]) => file);

  return {
    packages: reportPackages,
    components: localUsage,
    unusedFiles: unused
  };
}
