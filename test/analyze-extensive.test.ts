import { describe, it, expect } from "vitest";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

describe("react-prune analyzer (bash integration)", () => {
  const rootPath = path.join(__dirname, "fixtures/extensive");
  const binPath = path.resolve(__dirname, "../bin/react-prune");

  it("detects unused files and exports", async () => {
    // Run the bash script
    try {
      const { stdout } = await execAsync(`"${binPath}" analyze`, {
        cwd: rootPath
      });

      // Check output content
      expect(stdout).toContain(
        "\u26A0\uFE0F  Unused export: UnusedExportInFile in"
      );
      // Matches "⚠️  Unused export: UnusedExportInFile in ..."

      expect(stdout).toContain(
        "Unused file: " + path.join(rootPath, "ComponentC.tsx")
      );
      expect(stdout).toContain(
        "Unused file: " + path.join(rootPath, "useHookB.ts")
      );

      expect(stdout).not.toContain(
        "Unused file: " + path.join(rootPath, "ComponentA.tsx")
      );

      // Exports
      expect(stdout).toMatch(
        /Unused export: UnusedExportInFile in .*ComponentA.tsx/
      );
      expect(stdout).toMatch(/Unused export: unusedFunction in .*utils.ts/);
    } catch (e: any) {
      console.error(e.stdout);
      console.error(e.stderr);
      throw e;
    }
  });
});
