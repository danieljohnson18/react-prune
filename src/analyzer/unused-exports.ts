import { Project } from "ts-morph";
import path from "path";

export function findUnusedExports(
  project: Project,
  rootPath: string,
  importUsage: Map<string, Set<string>>,
  unusedFiles: string[]
): Record<string, string[]> {
  const unusedExports: Record<string, string[]> = {};

  for (const sourceFile of project.getSourceFiles()) {
    const filePath = sourceFile.getFilePath();
    const rel = path.relative(rootPath, filePath);

    if (unusedFiles.includes(rel)) continue;

    const exports = sourceFile.getExportedDeclarations();
    const unused: string[] = [];

    for (const [name] of exports) {
      let used = false;

      for (const [, usedNames] of importUsage) {
        if (usedNames.has(name)) {
          used = true;
          break;
        }
      }

      if (!used) unused.push(name);
    }

    if (unused.length) {
      unusedExports[rel] = unused;
    }
  }

  return unusedExports;
}
