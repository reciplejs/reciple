import type { Awaitable } from 'discord.js';
import path from 'node:path';
import { mkdir, readdir, stat } from 'node:fs/promises';
import micromatch from 'micromatch';
import { globby, isDynamicPattern } from 'globby';
import { CommandType, RecipleError, type Client } from '@reciple/core';
import type { AnyModule, AnyModuleData } from '../helpers/types.js';
import { colors, recursiveDefaults } from '@reciple/utils';
import { BaseModule } from './modules/BaseModule.js';
import { BaseModuleValidator } from './validation/BaseModuleValidator.js';
import { ModuleType } from '../helpers/constants.js';
import { PostconditionModule } from './modules/PostconditionModule.js';
import { PreconditionModule } from './modules/PreconditionModule.js';
import { EventModule } from './modules/events/EventModule.js';
import { MessageCommandModule } from './modules/commands/MessageCommandModule.js';
import { SlashCommandModule } from './modules/commands/SlashCommandModule.js';
import { ContextMenuCommandModule } from './modules/commands/ContextMenuCommandModule.js';
import { CommandModuleValidator } from './validation/CommandModuleValidator.js';
import { EventModuleValidator } from './validation/EventModuleValidator.js';
import { PreconditionModuleValidator } from './validation/PreconditionModule.js';
import { PostconditionModuleValidator } from './validation/PostconditionModule.js';
import type { Logger } from 'prtyprnt';

export class ModuleLoader {
    public readonly logger: Logger;

    public constructor(public readonly client: Client) {
        this.logger = this.client.logger.clone({
            label: 'ModuleLoader'
        });
    }

    public async findModules(ignoreErrors: boolean = false): Promise<AnyModule[]> {
        this.logger.debug('Scanning for modules...');

        const modulePaths = await ModuleLoader.scanForModules(this.client.config?.modules);
        const modules: AnyModule[] = [];

        this.logger.debug(`Found ${modulePaths.length} modules`, modulePaths);

        for (const path of modulePaths) {
            try {
                this.logger.debug(`Resolving module: ${colors.cyan(path)}`);
                modules.push(await ModuleLoader.resolveModulePath(path));
                this.logger.debug(`Resolved module: ${colors.cyan(path)}`);
            } catch (error) {
                this.logger.debug(`Failed to load module: ${colors.cyan(path)}`, error);
                if (ignoreErrors) continue;

                throw new RecipleError({
                    message: `Failed to load module: ${colors.cyan(path)}`,
                    cause: error
                });
            }
        }

        return modules;
    }

    public static async scanForDirectories(config?: Pick<ModuleLoader.Config, 'directories'> & { cwd?: string; createDirectories?: boolean; }) {
        const cwd = config?.cwd ?? process.cwd();

        let scanned: string[] = [];
        let directories: string[] = [];

        for (const directory of config?.directories ?? []) {
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

            if (!stats && config?.createDirectories !== false) {
                await mkdir(directory, { recursive: true });
            }

            directories.push(directory);
        }

        return directories;
    }

    public static async scanForModules(config?: ModuleLoader.Config & { cwd?: string; createDirectories?: boolean; }): Promise<string[]> {
        const directories = await ModuleLoader.scanForDirectories(config);

        let modules: string[] = [];

        directoryLoop: for (const directory of directories) {
            let files = await readdir(directory);

            if (config?.ignore?.length) {
                files = micromatch.not(files, config.ignore, {
                    cwd: directory,
                    matchBase: true,
                    dot: true
                });
            }

            files = files.map(f => path.join(directory, f));

            fileLoop: for (const file of files) {
                if (config?.filter && !(await config?.filter(file))) continue;
                modules.push(file);
            }
        }

        if (config?.sort) modules.sort(config.sort);

        return modules;
    }

    public static async resolveModulePath(filepath: string, options?: { cwd?: string; }): Promise<AnyModule> {
        const stats = await stat(filepath).catch(() => undefined);
        if (!stats) throw new RecipleError(`Module not found: ${filepath}`);

        const data = recursiveDefaults<AnyModule|AnyModuleData|undefined>(await import(`file://${path.resolve(options?.cwd ?? process.cwd(), filepath)}`));
        if (BaseModule.isModule(data)) return data;

        switch (data?.moduleType) {
            case ModuleType.Command:
                CommandModuleValidator.isValid(data);
                switch (data.type) {
                    case CommandType.Message: return MessageCommandModule.from(data);
                    case CommandType.Slash: return SlashCommandModule.from(data);
                    case CommandType.ContextMenu: return ContextMenuCommandModule.from(data);
                    default: throw new RecipleError(`Unknown command type from module: ${colors.cyan(filepath)}`);
                }
            case ModuleType.Event:
                EventModuleValidator.isValid(data);
                return EventModule.from(data);
            case ModuleType.Precondition:
                PreconditionModuleValidator.isValid(data);
                return PreconditionModule.from(data);
            case ModuleType.Postcondition:
                PostconditionModuleValidator.isValid(data);
                return PostconditionModule.from(data);
            case ModuleType.Base:
            default:
                BaseModuleValidator.isValid(data);
                return BaseModule.from(data);
        }
    }
}

export namespace ModuleLoader {
    export let globby: typeof import('globby')|null = null;

    export interface Config {
        directories?: string[];
        ignore?: string[];
        filter?: (filepath: string) => Awaitable<boolean>;
        sort?: (a: string, b: string) => number;
    }

    export async function getGlobby(): Promise<typeof import('globby')> {
        if (globby) return globby;

        return globby = await import('globby');
    }
}
