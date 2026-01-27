import path from "path";

export function findUnusedFiles(
  fileUsage: Record<string, number>,
  rootPath: string,
  entryPatterns: string[]
): string[] {
  return Object.entries(fileUsage)
    .filter(([file, count]) => {
      if (count > 0) return false;

      if (entryPatterns.some((p) => file.includes(p))) {
        return false;
      }

      const rel = path.relative(rootPath, file);
      if (!rel.includes(path.sep)) return false;

      return true;
    })
    .map(([file]) => file);
}
