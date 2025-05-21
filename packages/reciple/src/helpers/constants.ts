import { readFile } from 'node:fs/promises';
import { CLI } from '../classes/CLI.js';
import path from 'node:path';
import { logger } from 'prtyprnt';

const packageJSON = JSON.parse(await readFile(path.join(CLI.root, './package.json'), 'utf-8'));

export const cli = new CLI({
    name: packageJSON.name,
    description: packageJSON.description,
    build: packageJSON.version,
    subcommandsDir: path.join(path.dirname(CLI.bin), './commands'),
    logger
});
