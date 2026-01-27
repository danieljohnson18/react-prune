import fs from "fs";
import path from "path";

export interface PruneConfig {
  entryPatterns: string[];
  ignorePatterns: string[];
}

const DEFAULT_CONFIG: PruneConfig = {
  entryPatterns: ["pages/", "app/", "screens/", "main.", "index.", "App."],
  ignorePatterns: [
    "**/node_modules/**",
    "**/dist/**",
    "**/.next/**",
    "**/coverage/**"
  ]
};

export function loadConfig(rootPath: string): PruneConfig {
  const configPath = path.join(rootPath, "react-prune.config.json");

  if (!fs.existsSync(configPath)) {
    return DEFAULT_CONFIG;
  }

  try {
    const userConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    return {
      entryPatterns: userConfig.entryPatterns ?? DEFAULT_CONFIG.entryPatterns,
      ignorePatterns: userConfig.ignorePatterns ?? DEFAULT_CONFIG.ignorePatterns
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}
