import { execSync } from "child_process";
import path from "path";
import { expect, test } from "vitest";

const cliPath = path.resolve(__dirname, "../dist/cli.js");

test("CLI runs without crashing", () => {
  const output = execSync(`node ${cliPath} analyze --json`, { cwd: __dirname });
  const json = JSON.parse(output.toString());
  expect(json).toHaveProperty("packages");
  expect(json).toHaveProperty("unusedFiles");
  expect(json).toHaveProperty("unusedExports");
});
