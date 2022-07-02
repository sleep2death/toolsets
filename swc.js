import { promises as fs } from "fs";
import path from "path";

import chokidar from "chokidar";
import swc from "@swc/core";

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const args = yargs(hideBin(process.argv))
  .option("input", {
    alias: "i",
    description: "input files directory",
  })
  .option("output", {
    alias: "o",
    description: "output files directory",
  })
  .parse();

console.log("watch the javascript files for compiling...");
console.log("input:", args.input, "| output:", args.output);

chokidar.watch(`${args.input}/*.js`).on("change", async (filepath) => {
  const source = await fs.readFile(filepath);
  const filename = path.parse(filepath).base;

  console.log("compiling", filepath);
  try {
    const result = await swc.transform(source.toString(), {
      sourceMaps: true,
      isModule: false,
      jsc: {
        parser: {
          syntax: "ecmascript",
          jsx: false,
          dynamicImport: false,
          privateMethod: false,
          functionBind: false,
          exportDefaultFrom: false,
          exportNamespaceFrom: false,
          decorators: false,
          decoratorsBeforeExport: false,
          topLevelAwait: false,
          importMeta: false,
        },
        transform: null,
        target: "es2022",
        loose: false,
        externalHelpers: false,
        // Requires v1.2.50 or upper and requires target to be es2016 or upper.
        keepClassNames: true,
      },
    });

    await fs.writeFile(`${args.output}/${filename}`, result.code, "utf8");
    console.log("Done");
  } catch (err) {
    console.error(err);
  }
});
