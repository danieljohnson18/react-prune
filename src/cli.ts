#!/usr/bin/env node
import { Command } from "commander";
import pc from "picocolors";
import Table from "cli-table3";
import boxen from "boxen";
import path from "path";
import { analyzeProject, UsageReport } from "./analyzer";
import { getFileSize } from "./analyzer/file-size";
import { SyntaxKind, Identifier } from "ts-morph";

const program = new Command();

program
  .name("react-prune")
  .description("Analyze React/Next/Vite/React Native projects")
  .version(require("../package.json").version)
  .option("--no-size", "Skip package size calculation")
  .option("--no-exports", "Skip export usage analysis")
  .option("--limit <n>", "Limit output rows per table", "50");

program
  .command("analyze")
  .description("Run full project analysis")
  .option("--no-size", "Skip package size calculation")
  .option("--no-exports", "Skip export usage analysis")
  .option("--limit <n>", "Limit output rows per table", "50")
  .option("--json", "Output results as JSON")
  .action(async (opts) => {
    const rootPath = process.cwd();
    const limit = Number(opts.limit);

    const report: UsageReport = await analyzeProject({
      rootPath,
      includeSizes: opts.size,
      analyzeExports: opts.exports,
      silent: opts.json
    });

    if (opts.json) {
      // 1. Remove circular references (sourceFiles)
      // 2. Convert Sets to Arrays for valid JSON
      const { sourceFiles, usedExports, ...rest } = report;

      const sanitizedUsedExports: Record<string, string[]> = {};
      if (usedExports) {
        for (const [key, value] of Object.entries(usedExports)) {
          sanitizedUsedExports[key] = Array.from(value);
        }
      }

      console.log(
        JSON.stringify(
          {
            ...rest,
            usedExports: sanitizedUsedExports
          },
          null,
          2
        )
      );
      return;
    }

    // Packages
    const packageTable = new Table({
      head: [pc.cyan("Package"), "Count", "Size"],
      colWidths: [40, 10, 15]
    });
    Object.entries(report.packages)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, limit)
      .forEach(([pkg, data]) =>
        packageTable.push([pkg, data.count, data.size])
      );
    console.log(
      boxen(pc.bold("📦 Package Usage"), {
        padding: 1,
        borderColor: "green",
        borderStyle: "round"
      })
    );
    console.log(packageTable.toString());

    // Unused Files
    if (report.unusedFiles.length) {
      const table = new Table({
        head: [pc.yellow("Unused Files")],
        colWidths: [80]
      });
      report.unusedFiles.slice(0, limit).forEach((f) => table.push([f]));
      console.log(
        boxen(pc.bold(`⚠️ Unused Files (${report.unusedFiles.length})`), {
          padding: 1,
          borderColor: "yellow",
          borderStyle: "round"
        })
      );
      console.log(table.toString());
    }

    // Unused Exports
    if (opts.exports) {
      const entries = Object.entries(report.unusedExports);
      if (entries.length) {
        const table = new Table({
          head: ["File", "Unused Exports"],
          colWidths: [50, 40],
          wordWrap: true
        });
        entries
          .slice(0, limit)
          .forEach(([file, exports]) => table.push([file, exports.join(", ")]));
        console.log(
          boxen(pc.bold(`⚠️ Unused Exports`), {
            padding: 1,
            borderColor: "yellow",
            borderStyle: "round"
          })
        );
        console.log(table.toString());
      }
    }

    // Unused Dependencies
    if (report.unusedDependencies && report.unusedDependencies.length) {
      const table = new Table({
        head: [pc.yellow("Unused Dependencies")],
        colWidths: [80]
      });
      report.unusedDependencies.slice(0, limit).forEach((d) => table.push([d]));
      console.log(
        boxen(
          pc.bold(
            `⚠️ Unused Dependencies (${report.unusedDependencies.length})`
          ),
          {
            padding: 1,
            borderColor: "yellow",
            borderStyle: "round"
          }
        )
      );
      console.log(table.toString());
    }
  });

program
  .command("size <packageName>")
  .description("Check the size of a specific npm package in node_modules")
  .action(async (packageName) => {
    const rootPath = process.cwd();

    // Reuse helper from analyzer
    const { getPackageSize } = await import("./analyzer/package-size");

    const size = getPackageSize(rootPath, packageName);

    if (size === "N/A") {
      console.log(
        pc.yellow(`Package '${packageName}' not found in node_modules.`)
      );
    } else {
      console.log(pc.green(`📦 ${packageName} size: ${size}`));
    }
  });
// --- New find command with line numbers
program
  .command("find <exportName>")
  .description(
    "Find usage count and references (with line numbers) for a component/function/export"
  )
  .action(async (exportName) => {
    const rootPath = process.cwd();
    const report: UsageReport = await analyzeProject({
      rootPath,
      analyzeExports: true,
      includeSizes: false
    });

    const usageDetails: { file: string; line: number }[] = [];

    const usedExports = report.usedExports || {};

    for (const [file, usedSet] of Object.entries(usedExports)) {
      const sourceFile = report.sourceFiles?.[file];
      if (!sourceFile) continue;

      // Only process if this file actually uses the export
      if (!usedSet.has(exportName)) continue;

      // Traverse identifiers in the file
      const identifiers = sourceFile.getDescendantsOfKind(
        SyntaxKind.Identifier
      );

      identifiers.forEach((id: Identifier) => {
        // Check if identifier matches the export name
        if (id.getText() === exportName) {
          // Make sure this usage is actually an import/reference, not a declaration
          const parentKind = id.getParentOrThrow().getKindName();

          if (
            parentKind.includes("Import") || // ImportSpecifier, ImportClause, etc
            parentKind.includes("PropertyAccess") || // obj.exportName
            parentKind.includes("Identifier") // usage in code
          ) {
            usageDetails.push({ file, line: id.getStartLineNumber() });
          }
        }
      });
    }

    if (usageDetails.length) {
      console.log(
        pc.green(`'${exportName}' is used ${usageDetails.length} time(s):`)
      );
      usageDetails.forEach((d) => {
        const size = getFileSize(path.join(rootPath, d.file));
        console.log(` - ${d.file}:${d.line} (${size})`);
      });
    } else {
      console.log(pc.yellow(`'${exportName}' is not used anywhere.`));
    }
  });

program.parse(process.argv);
