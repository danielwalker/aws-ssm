#!/usr/bin/env node

import yargs from 'yargs/yargs';
import fs from 'fs'
import pThrottle from 'p-throttle';
import {PutParameterCommand, SSMClient} from '@aws-sdk/client-ssm'

const argv = yargs(process.argv.slice(2))
    .options({
        p: {
            type: 'string',
            alias: 'path',
            description: 'Prepends the path to all Paramaters. Useful for writing .env files'
        },
        f: {
            type: 'string',
            alias: 'file',
            description: 'The file to read',
            demandOption: true,
        },
        o: {
            type: 'boolean',
            alias: 'overwrite',
            description: 'Overwrite the Parameter if it exists',
            default: false
        }
    })
    .parseSync();

const {f: file, p: path, o: overwrite} = argv;

const ssm = new SSMClient();

if (path && !path.endsWith('/')) {
    console.log(`Error: Path must end in /.`)
    process.exit(1)
}

// A 2 per second p-throttle.
const throttle = pThrottle({
    limit: 2,
    interval: 1000
});

(async () => {

    if (!fs.existsSync(file)) {
        console.log(`Error: ${file} does not exist.`)
        process.exit(1)
    }

    const lines = fs.readFileSync(file).toString().split('\n')

    for (let i = 0; i < lines.length; i++) {

        const [k, v] = lines[i].split('=');

        if (k && v) {
            const name = `${path ?? ''}${k.trim()}`;
            const value = v.trim();

            // There is a rate limit at AWS.
            const throttled = throttle(() => {
                return ssm.send(new PutParameterCommand({
                    Name: name,
                    Value: value,
                    Type: "String",
                    Overwrite: overwrite
                }))
            })

            // Call the throttled function.
            await throttled();

            console.log(`Written ${name} = ${value}`);
        }
    }
})();
