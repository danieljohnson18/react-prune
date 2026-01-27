#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { analyzeProject } from "./analyzer";
// @ts-ignore
import Table from "cli-table3";
// @ts-ignore
import boxen from "boxen";

const program = new Command();

program
  .name("react-prune")
  .description(
    "Monitor usage of packages and component imports across your React/Next.js/React Native app"
  )
  .version("1.0.0");

program
  .command("analyze")
  .description("Analyze the current project for package and component usage")
  .action(async () => {
    console.log(chalk.blue("Starting analysis..."));
    try {
      const report = await analyzeProject(process.cwd());

      // Package Usage Table
      const packageTable = new Table({
        head: [
          chalk.cyan("Package Name"),
          chalk.cyan("Usage Count"),
          chalk.cyan("Est. Size")
        ],
        colWidths: [40, 15, 15]
      });

      const sortedPackages = Object.entries(report.packages).sort(
        (a, b) => b[1].count - a[1].count
      );

      sortedPackages.slice(0, 50).forEach(([pkg, data]) => {
        packageTable.push([pkg, data.count, data.size]);
      });

      console.log(
        boxen(chalk.bold("📦 Package Usage Report"), {
          padding: 1,
          margin: 1,
          borderStyle: "round",
          borderColor: "green"
        })
      );
      console.log(packageTable.toString());
      if (sortedPackages.length > 50) {
        console.log(
          chalk.gray(`...and ${sortedPackages.length - 50} more packages.`)
        );
      }

      // Unused Files
      if (report.unusedFiles.length > 0) {
        const unusedTable = new Table({
          head: [chalk.yellow("File Path")],
          colWidths: [80]
        });

        console.log(
          boxen(
            chalk.bold(
              `⚠️  Potential Unused Files (${report.unusedFiles.length})`
            ),
            {
              padding: 1,
              margin: 1,
              borderStyle: "round",
              borderColor: "yellow"
            }
          )
        );

        report.unusedFiles.forEach((file) => unusedTable.push([file]));
        console.log(unusedTable.toString());
      } else {
        console.log(
          boxen(chalk.bold("✅ No unused files detected!"), {
            padding: 1,
            margin: 1,
            borderStyle: "round",
            borderColor: "green"
          })
        );
      }
    } catch (error) {
      console.error(chalk.red("Analysis failed:"), error);
      process.exit(1);
    }
  });

program.parse(process.argv);
