#!/usr/bin/env node
import { Command } from "commander";
import pc from "picocolors";
import path from "path";
import Table from "cli-table3";
import boxen from "boxen";
import { analyzeProject } from "./analyzer";

const program = new Command();

program
  .name("react-prune")
  .description(
    "Analyze React/Next/Vite/React Native codebases for unused files, exports, and packages"
  )
  .version(require("../package.json").version)
  .option("--no-size", "Skip calculating package sizes")
  .option("--no-exports", "Skip analyzing unused exports")
  .option("--limit <n>", "Limit output rows", "50");

program.action(async (opts) => {
  const rootPath = process.cwd();
  const limit = Number(opts.limit);

  const report = await analyzeProject({
    rootPath,
    includeSizes: opts.size,
    analyzeExports: opts.exports
  });

  // ---------- Packages ----------
  console.log(
    boxen(pc.bold("📦 Package Usage"), {
      padding: 1,
      borderColor: "green",
      borderStyle: "round"
    })
  );

  const packageTable = new Table({ head: ["Package", "Count", "Size"] });
  Object.entries(report.packages)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .forEach(([pkg, data]) => packageTable.push([pkg, data.count, data.size]));

  console.log(packageTable.toString());

  // ---------- Unused Files ----------
  if (report.unusedFiles.length) {
    console.log(
      boxen(pc.bold(`⚠️ Unused Files (${report.unusedFiles.length})`), {
        padding: 1,
        borderColor: "yellow"
      })
    );
    report.unusedFiles.forEach((f) => console.log(pc.yellow(f)));
  } else {
    console.log(
      boxen(pc.green("✅ No unused files detected!"), {
        padding: 1,
        borderColor: "green"
      })
    );
  }

  // ---------- Unused Exports ----------
  const unusedExportsEntries = Object.entries(report.unusedExports);
  if (unusedExportsEntries.length) {
    console.log(
      boxen(
        pc.bold(`⚠️ Potential Unused Exports (${unusedExportsEntries.length})`),
        {
          padding: 1,
          borderColor: "yellow"
        }
      )
    );
    const exportsTable = new Table({
      head: ["File", "Unused Exports"],
      wordWrap: true
    });
    unusedExportsEntries.slice(0, limit).forEach(([file, exports]) => {
      exportsTable.push([file, exports.join(", ")]);
    });
    console.log(exportsTable.toString());
  }
});

program.parse();
