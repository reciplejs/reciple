import { readFile } from 'node:fs/promises';
import { CLI } from '../classes/CLI.js';
import path from 'node:path';
import { logger } from 'prtyprnt';
import type { PackageJson } from '@reciple/utils';

/**
 * @private
 */
export const packageJSON: PackageJson = JSON.parse(await readFile(path.join(CLI.root, './package.json'), 'utf-8'));

export const cli = new CLI({
    name: packageJSON.name ?? 'reciple',
    description: packageJSON.description ?? '',
    build: packageJSON.version ?? '0.0.0',
    subcommandsDir: path.join(path.dirname(CLI.bin), './commands'),
    logger
});
