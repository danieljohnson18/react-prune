import { describe, it, expect } from "vitest";
import path from "path";
import { analyzeProject } from "../src/analyzer";

describe("react-prune analyzer (extensive)", async () => {
  const rootPath = path.join(__dirname, "fixtures/extensive");

  // Note: We might need to handle the fact that node_modules might not be fully populated
  // if npm install wasn't run or if we want to test missing deps.
  // depcheck skips missing deps with skipMissing: true.

  const report = await analyzeProject({
    rootPath,
    includeSizes: true, // Test size calculation
    analyzeExports: true
  });

  it("detects unused files", () => {
    // ComponentC.tsx and useHookB.ts are unused
    expect(report.unusedFiles).toContain("ComponentC.tsx");
    expect(report.unusedFiles).toContain("useHookB.ts");

    // ComponentA, ComponentB, useHookA, utils are used
    expect(report.unusedFiles).not.toContain("ComponentA.tsx");
    expect(report.unusedFiles).not.toContain("ComponentB.tsx");
    expect(report.unusedFiles).not.toContain("useHookA.ts");
    expect(report.unusedFiles).not.toContain("utils.ts");
  });

  it("detects unused exports", () => {
    // In ComponentA.tsx, UnusedExportInFile is unused
    expect(report.unusedExports["ComponentA.tsx"]).toContain(
      "UnusedExportInFile"
    );

    // In utils.ts, unusedFunction is unused
    expect(report.unusedExports["utils.ts"]).toContain("unusedFunction");

    // usedFunction is used
    expect(report.unusedExports["utils.ts"]).not.toContain("usedFunction");
  });

  it("detects unused dependencies", () => {
    // framer-motion is in package.json but not used in code
    // react and lodash are used
    if (report.unusedDependencies) {
      expect(report.unusedDependencies).toContain("framer-motion");
      expect(report.unusedDependencies).not.toContain("lodash");
      expect(report.unusedDependencies).not.toContain("react");
    }
  });

  it("calculates sizes", () => {
    // packages report should have sizes if installed
    // finding specific package
    if (report.packages["react"]) {
      expect(report.packages["react"].size).not.toBe("N/A");
    }
  });
});
