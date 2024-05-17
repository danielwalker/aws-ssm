#!/usr/bin/env node

import yargs from "yargs/yargs";
import fs from "fs";
import pThrottle from "p-throttle";
import { PutParameterCommand, SSMClient } from "@aws-sdk/client-ssm";

const argv = yargs(process.argv.slice(2))
  .options({
    p: {
      type: "string",
      alias: "path",
      description:
        "Prepends the path to all Parameters. Useful for writing .env files",
    },
    f: {
      type: "string",
      alias: "file",
      description: "The file to read. ",
      demandOption: true,
    },
    e: {
      type: "boolean",
      alias: "dotEnv",
      description: "Does the file contain plain .env properties",
      default: false,
    },
    o: {
      type: "boolean",
      alias: "overwrite",
      description: "Overwrite the Parameter if it exists",
      default: false,
    },
  })
  .parseSync();

const { f: file, p: path, o: overwrite, e: dotEnv } = argv;

const ssm = new SSMClient();

if (path && !path.endsWith("/")) {
  console.log(`Error: Path must end in /.`);
  process.exit(1);
}

// A 2 per second p-throttle.
const throttle = pThrottle({
  limit: 2,
  interval: 1000,
});

(async () => {
  if (!fs.existsSync(file)) {
    console.log(`Error: ${file} does not exist.`);
    process.exit(1);
  }

  const items = readFile(file);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // There is a rate limit at AWS.
    const throttled = throttle(() => {
      return ssm.send(
        new PutParameterCommand({
          ...item,
          Overwrite: overwrite,
        }),
      );
    });

    // Call the throttled function.
    await throttled();

    console.log(`Written ${item.Name} = ${item.Value} (${item.Type})`);
  }
})();

function readFile() {
  const content = fs.readFileSync(file).toString();

  // If not a .env then we parse as json and assume it's the output from aws-ssm-read.
  if (!dotEnv) {
    return JSON.parse(content);
  }

  // Read as a properties file
  const lines = content.split("\n");
  return lines.map((line) => {
    const [k, v] = line.split("=");
    const name = `${path ?? ""}${k.trim()}`;
    const value = v.trim();

    // If Parsing as properties we must assume the type is String.
    return {
      Name: name,
      Value: value,
      Type: "String",
    };
  });
}
