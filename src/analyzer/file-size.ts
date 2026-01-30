import fs from "fs";

export function getFileSize(filePath: string): string {
  try {
    const stats = fs.statSync(filePath);
    const bytes = stats.size;
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  } catch {
    return "N/A";
  }
}
