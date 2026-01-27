import { Project } from "ts-morph";
import path from "path";
import fs from "fs";

export function createProject(rootPath: string, files: string[]): Project {
  const tsConfigPath = path.join(rootPath, "tsconfig.json");

  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    tsConfigFilePath: fs.existsSync(tsConfigPath) ? tsConfigPath : undefined
  });

  for (const file of files) {
    try {
      project.addSourceFileAtPath(file);
    } catch {
      // skip broken files safely
    }
  }

  return project;
}
