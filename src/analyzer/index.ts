import { Project, SyntaxKind, SourceFile } from "ts-morph";
import glob from "fast-glob";
import path from "path";
import fs from "fs";
import pc from "picocolors";
import { AnalyzerOptions, UsageReport } from "./types";

export * from "./types";

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
  } catch {}
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
  if (fs.existsSync(pkgPath)) return formatBytes(getFolderSize(pkgPath));
  return "N/A";
}

export async function analyzeProject(
  options: AnalyzerOptions
): Promise<UsageReport> {
  const {
    rootPath,
    includeSizes = true,
    analyzeExports = true,
    silent = false
  } = options;

  if (!silent) {
    console.log(pc.green(`Analyzing project at ${rootPath}`));
  }

  // 1️⃣ Collect all JS/TS files
  const files = await glob("**/*.{js,jsx,ts,tsx}", {
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
  });

  if (!silent) {
    console.log(pc.blue(`Found ${files.length} files to analyze.`));
  }

  const project = new Project({ skipAddingFilesFromTsConfig: true });
  const tsConfigPath = path.join(rootPath, "tsconfig.json");
  if (fs.existsSync(tsConfigPath)) {
    project.addSourceFilesFromTsConfig(tsConfigPath);
  }
  files.forEach((f) => {
    try {
      project.addSourceFileAtPath(f);
    } catch {
      console.warn(pc.yellow(`Skipping ${f}`));
    }
  });

  // 2️⃣ Track package usage and file exports
  const packageUsage: Record<string, number> = {};
  const fileExports: Record<string, { named: Set<string>; default: boolean }> =
    {};
  const usedExports: Record<string, Set<string>> = {};
  const sourceFiles: Record<string, SourceFile> = {};

  for (const sourceFile of project.getSourceFiles()) {
    const relativePath = path
      .relative(rootPath, sourceFile.getFilePath())
      .replace(/\\/g, "/");
    sourceFiles[relativePath] = sourceFile;

    const exportsMap = sourceFile.getExportedDeclarations();
    const namedExports = new Set<string>();
    exportsMap.forEach((decls, name) => {
      if (name !== "default") namedExports.add(name);
    });
    const hasDefault = exportsMap.has("default");

    fileExports[relativePath] = { named: namedExports, default: hasDefault };
    usedExports[relativePath] = new Set();

    // Track package imports
    const imports = sourceFile.getImportDeclarations();
    imports.forEach((imp) => {
      const mod = imp.getModuleSpecifierValue();
      if (!mod.startsWith(".") && !mod.startsWith("/")) {
        const pkg = mod.startsWith("@")
          ? mod.split("/").slice(0, 2).join("/")
          : mod.split("/")[0];
        packageUsage[pkg] = (packageUsage[pkg] || 0) + 1;
      }
    });

    // Track require()
    const calls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
    calls.forEach((call) => {
      if (call.getExpression().getText() === "require") {
        const args = call.getArguments();
        if (args.length && args[0].getKind() === SyntaxKind.StringLiteral) {
          const mod = args[0].getText().replace(/['"`]/g, "");
          if (!mod.startsWith(".") && !mod.startsWith("/")) {
            const pkg = mod.startsWith("@")
              ? mod.split("/").slice(0, 2).join("/")
              : mod.split("/")[0];
            packageUsage[pkg] = (packageUsage[pkg] || 0) + 1;
          }
        }
      }
    });
  }

  // 3️⃣ Track used exports across files
  if (analyzeExports) {
    for (const sourceFile of project.getSourceFiles()) {
      const imports = sourceFile.getImportDeclarations();
      const relativePath = path
        .relative(rootPath, sourceFile.getFilePath())
        .replace(/\\/g, "/");

      imports.forEach((imp) => {
        const mod = imp.getModuleSpecifierValue();
        if (mod.startsWith(".") || mod.startsWith("/")) {
          const sourceDir = path.dirname(sourceFile.getFilePath());
          let resolvedPath = path.resolve(sourceDir, mod);
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
          let foundFile: string | undefined;

          for (const ext of extensions) {
            const tryPath = path
              .relative(rootPath, resolvedPath + ext)
              .replace(/\\/g, "/");
            if (fileExports[tryPath]) {
              foundFile = tryPath;
              break;
            }
          }

          if (foundFile) {
            imp
              .getNamedImports()
              .forEach((ni) => usedExports[foundFile].add(ni.getName()));
            if (imp.getDefaultImport()) usedExports[foundFile].add("default");
          }
        }
      });
    }
  }

  // 4️⃣ Determine unused files and exports
  const unusedFiles = Object.entries(fileExports)
    .filter(([file, exports]) => {
      if (
        file.includes("pages/") ||
        file.includes("app/") ||
        file.endsWith("index.tsx") ||
        file.endsWith("App.tsx")
      )
        return false;
      const used = usedExports[file];
      if (exports.named.size === 0 && !exports.default) return false;
      return used.size === 0;
    })
    .map(([file]) => file);

  const unusedExports: Record<string, string[]> = {};
  if (analyzeExports) {
    Object.entries(fileExports).forEach(([file, exports]) => {
      const used = usedExports[file];
      const unused: string[] = [];
      if (exports.default && !used.has("default")) unused.push("default");
      exports.named.forEach((name) => {
        if (!used.has(name)) unused.push(name);
      });
      if (unused.length) unusedExports[file] = unused;
    });
  }

  // 5️⃣ Build package report
  const packages: Record<string, { count: number; size: string }> = {};
  Object.entries(packageUsage).forEach(([pkg, count]) => {
    packages[pkg] = {
      count,
      size: includeSizes ? getPackageSize(rootPath, pkg) : "—"
    };
  });

  return {
    packages,
    unusedFiles,
    unusedExports,
    usedExports,
    sourceFiles
  };
}

export { getPackageSize };
