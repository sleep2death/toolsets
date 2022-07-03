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

const files = await fs.readdir(args.input);
files.forEach(async (file) => {
  if (path.parse(file).ext === ".js") {
    await compile(`${args.input}/${file}`, `${args.output}/${file}`);
  }
});

chokidar.watch(`${args.input}/*.js`).on("change", async (filepath) => {
  const base = path.parse(filepath).base;
  await compile(filepath, `${args.output}/${base}`);
});

async function compile(source, target) {
  const src = await fs.readFile(source);

  console.log("compiling", source);
  const start = new Date().getTime();
  try {
    const result = await swc.transform(src.toString(), {
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
        target: "es2019",
        loose: false,
        externalHelpers: false,
        // Requires v1.2.50 or upper and requires target to be es2016 or upper.
        keepClassNames: true,
      },
    });

    await fs.writeFile(target, result.code, "utf8");
    console.log("Done", target, new Date().getTime() - start + "ms");
  } catch (err) {
    console.error(err);
  }
}
