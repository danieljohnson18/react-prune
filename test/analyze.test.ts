import { describe, it, expect } from "vitest";
import path from "path";
import { analyzeProject } from "../src/analyzer";

describe("react-prune analyzer", async () => {
  const rootPath = path.join(__dirname, "fixtures/simple");

  const report = await analyzeProject({
    rootPath,
    includeSizes: false
  });

  it("detects unused files", () => {
    expect(report.unusedFiles).toContain("unused.ts");
  });

  it("detects unused exports", () => {
    const entries = Object.values(report.unusedExports).flat();
    expect(entries).toContain("unusedFn");
  });

  it("does not mark used exports as unused", () => {
    const entries = Object.values(report.unusedExports).flat();
    expect(entries).not.toContain("usedFn");
  });
});
