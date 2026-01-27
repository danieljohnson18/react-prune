import path from "path";

export function getPackageSize(
  rootPath: string,
  pkg: string
): string | undefined {
  try {
    const pkgJson = require(
      path.join(rootPath, "node_modules", pkg, "package.json")
    );
    if (typeof pkgJson.size === "number") {
      return `${(pkgJson.size / 1024).toFixed(2)} KB`;
    }
  } catch {}
  return undefined;
}
