import type { Awaitable } from 'discord.js';
import type { ConfigReader } from './ConfigReader.js';
import path from 'node:path';
import { mkdir, readdir, stat } from 'node:fs/promises';
import micromatch from 'micromatch';
import { globby, isDynamicPattern } from 'globby';
import type { Logger, LoggerOptions } from 'prtyprnt';

export class ModuleLoader {
    public constructor(public readonly config: ConfigReader) {
        this.config = config;
    }

    public static async scanForDirectories(config: Pick<ModuleLoader.Config, 'directories'> & { cwd?: string; createDirectories?: boolean; }) {
        const cwd = config.cwd ?? process.cwd();

        let scanned: string[] = [];
        let directories: string[] = [];

        for (const directory of config.directories ?? []) {
            if (isDynamicPattern(directory, { cwd })) {
                const matches = await globby(directory, {
                    cwd,
                    onlyDirectories: true,
                    absolute: true
                });

                scanned.push(...matches);
                continue;
            }

            scanned.push(path.join(cwd, directory));
        }

        for (const directory of scanned) {
            const stats = await stat(directory).catch(() => undefined);

            if (!stats && config.createDirectories !== false) {
                await mkdir(directory, { recursive: true });
            }

            directories.push(directory);
        }

        return directories;
    }

    public static async scanForModules(config: ModuleLoader.Config & { cwd?: string; createDirectories?: boolean; }): Promise<string[]> {
        const directories = await ModuleLoader.scanForDirectories(config);

        let modules: string[] = [];

        directoryLoop: for (const directory of directories) {
            let files = await readdir(directory);

            if (config.ignore?.length) {
                files = micromatch.not(files, config.ignore, {
                    cwd: directory,
                    matchBase: true,
                    dot: true
                });
            }

            files = files.map(f => path.join(directory, f));

            fileLoop: for (const file of files) {
                if (config.filter && !(await config.filter(file))) continue;
                modules.push(file);
            }
        }

        if (config.sort) modules.sort(config.sort);

        return modules;
    }
}

export namespace ModuleLoader {
    export let globby: typeof import('globby')|null = null;

    export interface Config {
        directories?: string[];
        ignore?: string[];
        logger?: Logger|LoggerOptions;
        filter?: (filepath: string) => Awaitable<boolean>;
        sort?: (a: string, b: string) => number;
    }

    export async function getGlobby(): Promise<typeof import('globby')> {
        if (globby) return globby;

        return globby = await import('globby');
    }
}
