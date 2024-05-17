#!/usr/bin/env node

import yargs from "yargs/yargs";
import { GetParametersByPathCommand, SSMClient } from "@aws-sdk/client-ssm";

const argv = yargs(process.argv.slice(2))
  .options({
    p: {
      type: "string",
      alias: "path",
      description: "The SSM path to read parameters from",
      default: "/",
    },
    e: {
      type: "boolean",
      alias: "dotEnv",
      description: "Output plain .env properties",
      default: false,
    },
  })
  .parseSync();

const { p: path, e: dotEnv } = argv;

const ssm = new SSMClient();

(async () => {
  const parameters = await readPage(path, []);

  if (dotEnv) {
    parameters.forEach((parameter) => {
      console.log(
        `${parameter.Name.split("/").reverse()[0]}=${parameter.Value}`,
      );
    });
  } else {
    const json = parameters.map((parameter) => {
      return {
        Type: parameter.Type,
        Name: parameter.Name,
        Value: parameter.Value,
      };
    });

    console.log(JSON.stringify(json, null, 2));
  }
})();

async function readPage(path, results, nextToken) {
  const r = await ssm.send(
    new GetParametersByPathCommand({
      Path: path,
      NextToken: nextToken,
      Recursive: true,
      WithDecryption: true,
    }),
  );

  const newResults = [...results, ...r.Parameters];

  if (r.NextToken) {
    return readPage(path, newResults, r.NextToken);
  }

  return newResults;
}
