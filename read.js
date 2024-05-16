#!/usr/bin/env node

import yargs from 'yargs/yargs';
import fs from 'fs'
import {GetParametersByPathCommand, SSMClient} from '@aws-sdk/client-ssm'

const argv = yargs(process.argv.slice(2))
    .options({
        p: {
            type: 'string',
            alias: 'path',
            description: 'The SSM path to read parameters from',
            default: '/'
        },
        f: {
            type: 'string',
            alias: 'file',
            description: 'The file to write to',
            demandOption: true,
        },
        s: {
            type: 'boolean',
            alias: 'stripPath',
            description: 'Should SSM paths be stripped from the output?',
            default: false,
        },
        o: {
            type: 'boolean',
            alias: 'overwrite',
            description: 'Overwrite the output file',
            default: false,
        }
    })
    .parseSync();

const {f: file, p: path, s: stripPath, o: overwrite} = argv;

const ssm = new SSMClient();

(async () => {
    if (fs.existsSync(file)) {
        if (overwrite === true) {
            fs.truncateSync(file);
        } else {
            console.log(`Error: ${file} already exists [re]move it first.`)
            process.exit(1)
        }
    }

    const parameters = await readPage(path, [])

    parameters.forEach((parameter) => {
        fs.appendFileSync(file, `${getParameterName(parameter)}=${parameter['Value']}\n`);
    })
})();


function getParameterName(parameter) {
    let name = parameter['Name'];
    if (stripPath) {
        return name.split('/').reverse()[0];
    }
    return name;
}

async function readPage(path, results, nextToken) {
    const r = await ssm.send(
        new GetParametersByPathCommand({
            Path: path,
            NextToken: nextToken,
            Recursive: true,
            WithDecryption: true,
        }));

    const newResults = [...results, ...r.Parameters];

    if (r.NextToken) {
        return readPage(path, newResults, r.NextToken);
    }

    return newResults;
}
