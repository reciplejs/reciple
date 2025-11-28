import { CLI } from '../classes/cli/CLI.js';
import path from 'node:path';
import { logger } from 'prtyprnt';
import type { PackageJson } from '@reciple/utils';

/**
 * @private
 */
export const packageJSON = await import('../../package.json', { with: { type: 'json' } }).then(m => m.default as PackageJson);

export const cli = new CLI({
    name: packageJSON.name ?? 'reciple',
    description: packageJSON.description ?? '',
    build: packageJSON.version ?? '0.0.0',
    subcommandsDir: path.join(path.dirname(CLI.bin), './commands'),
    logger
});

export enum ModuleType {
    Base = 1,
    Command,
    Event,
    Precondition,
    Postcondition
}
