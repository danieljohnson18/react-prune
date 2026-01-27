import path from "path";
import { Project, SyntaxKind } from "ts-morph";

export function analyzeImports(
  project: Project,
  rootPath: string,
  files: string[]
) {
  const fileUsage: Record<string, number> = {};
  const packageUsage: Record<string, number> = {};
  const importUsage = new Map<string, Set<string>>();

  for (const file of files) {
    fileUsage[path.relative(rootPath, file)] = 0;
  }

  for (const sourceFile of project.getSourceFiles()) {
    const sourcePath = sourceFile.getFilePath();

    for (const imp of sourceFile.getImportDeclarations()) {
      const spec = imp.getModuleSpecifierValue();

      // ts-morph resolution (best case)
      const resolved = imp.getModuleSpecifierSourceFile();
      if (resolved) {
        const rel = path.relative(rootPath, resolved.getFilePath());
        fileUsage[rel]++;

        const names = imp.getNamedImports().map((n) => n.getName());

        if (names.length) {
          importUsage.set(rel, new Set(names));
        }
        continue;
      }

      // package import
      if (!spec.startsWith(".") && !spec.startsWith("/")) {
        const pkg = spec.startsWith("@")
          ? spec.split("/").slice(0, 2).join("/")
          : spec.split("/")[0];

        packageUsage[pkg] = (packageUsage[pkg] || 0) + 1;
      }
    }

    // require()
    for (const call of sourceFile.getDescendantsOfKind(
      SyntaxKind.CallExpression
    )) {
      if (call.getExpression().getText() !== "require") continue;
      const arg = call.getArguments()[0];
      if (!arg || !arg.isKind(SyntaxKind.StringLiteral)) continue;

      const raw = arg.getText().replace(/['"`]/g, "");
      if (raw.startsWith(".") || raw.startsWith("/")) continue;

      const pkg = raw.startsWith("@")
        ? raw.split("/").slice(0, 2).join("/")
        : raw.split("/")[0];

      packageUsage[pkg] = (packageUsage[pkg] || 0) + 1;
    }
  }

  return { fileUsage, packageUsage, importUsage };
}
