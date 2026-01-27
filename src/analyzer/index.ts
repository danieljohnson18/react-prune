import { Project, SyntaxKind, Node } from "ts-morph";
import glob from "fast-glob";
import path from "path";
import fs from "fs";
import pc from "picocolors";

export interface UsageReport {
  packages: Record<string, { count: number; size: string }>;
  components: Record<string, number>;
  unusedFiles: string[];
  unusedExports: Record<string, string[]>;
}

export interface AnalyzerOptions {
  rootPath: string;
  includeSizes?: boolean;
  analyzeExports?: boolean;
}

// --- Helper: calculate folder size recursively
function getFolderSize(dirPath: string): number {
  let size = 0;
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) size += getFolderSize(filePath);
      else size += stats.size;
    }
  } catch {
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
  const pkgPath = path.join(rootPath, "node_modules", packageName);
  if (fs.existsSync(pkgPath)) {
    const size = getFolderSize(pkgPath);
    return formatBytes(size);
  }
  return "N/A";
}

// --- Analyzer function
export async function analyzeProject(
  options: AnalyzerOptions
): Promise<UsageReport> {
  const { rootPath, includeSizes = true, analyzeExports = true } = options;

  console.log(pc.green(`Analyzing project at ${rootPath}`));

  // --- 1. Find all JS/TS files
  const files = await glob(
    "**/*.{js,jsx,ts,tsx,ios.tsx,android.tsx,native.tsx}",
    {
      cwd: rootPath,
      ignore: [
        "**/node_modules/**",
        "**/dist/**",
        "**/build/**",
        "**/.next/**",
        "**/coverage/**",
        "**/*.config.{js,ts,cjs,mjs}",
        "**/*.d.ts"
      ],
      absolute: true
    }
  );

  console.log(pc.blue(`Found ${files.length} files to analyze.`));

  // --- 2. Initialize ts-morph project
  const tsConfigPath = path.join(rootPath, "tsconfig.json");
  const projectConfig: any = { skipAddingFilesFromTsConfig: true };
  if (fs.existsSync(tsConfigPath))
    projectConfig.tsConfigFilePath = tsConfigPath;

  const project = new Project(projectConfig);

  files.forEach((file) => {
    try {
      project.addSourceFileAtPath(file);
    } catch (e) {
      console.warn(pc.yellow(`Skipping file ${file}:`), e);
    }
  });

  const packageUsage: Record<string, number> = {};
  const localUsage: Record<string, number> = {};

  files.forEach((f) => {
    const relative = path.relative(rootPath, f).replace(/\\/g, "/");
    localUsage[relative] = 0;
  });

  // --- 3. Analyze imports
  for (const sourceFile of project.getSourceFiles()) {
    const imports = sourceFile.getImportDeclarations();

    for (const imp of imports) {
      const moduleSpecifier = imp.getModuleSpecifierValue();

      if (moduleSpecifier.startsWith(".") || moduleSpecifier.startsWith("/")) {
        // Local import
        const sourceDir = path.dirname(sourceFile.getFilePath());
        const resolvedPath = path.resolve(sourceDir, moduleSpecifier);
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
          const relativeTry = path
            .relative(rootPath, tryPath)
            .replace(/\\/g, "/");
          if (localUsage.hasOwnProperty(relativeTry)) {
            localUsage[relativeTry]++;
            break;
          }
        }
      } else {
        // Package import
        const packageName = moduleSpecifier.startsWith("@")
          ? moduleSpecifier.split("/").slice(0, 2).join("/")
          : moduleSpecifier.split("/")[0];
        packageUsage[packageName] = (packageUsage[packageName] || 0) + 1;
      }
    }

    // --- Require() CommonJS
    const callExpressions = sourceFile.getDescendantsOfKind(
      SyntaxKind.CallExpression
    );
    for (const call of callExpressions) {
      const expression = call.getExpression();
      if (expression.getText() === "require") {
        const args = call.getArguments();
        if (args.length && args[0].getKind() === SyntaxKind.StringLiteral) {
          const rawArg = args[0].getText().replace(/['"`]/g, "");
          if (!rawArg.startsWith(".") && !rawArg.startsWith("/")) {
            const pkg = rawArg.startsWith("@")
              ? rawArg.split("/").slice(0, 2).join("/")
              : rawArg.split("/")[0];
            packageUsage[pkg] = (packageUsage[pkg] || 0) + 1;
          }
        }
      }
    }
  }

  // --- 4. Packages
  const reportPackages: Record<string, { count: number; size: string }> = {};
  for (const [pkg, count] of Object.entries(packageUsage)) {
    reportPackages[pkg] = {
      count,
      size: includeSizes ? getPackageSize(rootPath, pkg) : "—"
    };
  }

  // --- 5. Unused files
  const unused = Object.entries(localUsage)
    .filter(([file, count]) => {
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
      if (
        !file.includes(path.sep) &&
        !file.endsWith(".ts") &&
        !file.endsWith(".tsx") &&
        !file.endsWith(".js") &&
        !file.endsWith(".jsx")
      )
        return false;
      return count === 0;
    })
    .map(([file]) => file);

  // --- 6. Unused exports
  const unusedExports: Record<string, string[]> = {};
  if (analyzeExports) {
    for (const sourceFile of project.getSourceFiles()) {
      const filePath = sourceFile.getFilePath();
      const relativePath = path
        .relative(rootPath, filePath)
        .replace(/\\/g, "/");

      if (
        filePath.includes("pages/") ||
        filePath.includes("app/") ||
        filePath.endsWith("main.tsx") ||
        filePath.endsWith("index.tsx") ||
        filePath.endsWith("index.js") ||
        filePath.endsWith("App.tsx") ||
        filePath.endsWith("App.js") ||
        unused.includes(filePath)
      )
        continue;

      const exportedDeclarations = sourceFile.getExportedDeclarations();
      const fileUnusedExports: string[] = [];

      for (const [name, declarations] of exportedDeclarations) {
        let isUsed = false;

        for (const decl of declarations) {
          // --- Type guard: only check certain declaration types
          if (
            Node.isFunctionDeclaration(decl) ||
            Node.isClassDeclaration(decl) ||
            Node.isVariableDeclaration(decl) ||
            Node.isEnumDeclaration(decl) ||
            Node.isInterfaceDeclaration(decl) ||
            Node.isTypeAliasDeclaration(decl)
          ) {
            try {
              const refs = decl.findReferences();
              for (const ref of refs) {
                for (const entry of ref.getReferences()) {
                  if (entry.getSourceFile().getFilePath() !== filePath) {
                    isUsed = true;
                    break;
                  }
                }
                if (isUsed) break;
              }
            } catch {
              isUsed = true;
            }
          } else {
            // Other export types: assume used
            isUsed = true;
          }

          if (isUsed) break;
        }

        if (!isUsed) fileUnusedExports.push(name);
      }

      if (fileUnusedExports.length)
        unusedExports[relativePath] = fileUnusedExports;
    }
  }

  return {
    packages: reportPackages,
    components: localUsage,
    unusedFiles: unused,
    unusedExports
  };
}
