import { type Awaitable } from 'discord.js';
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
import { EventEmitter } from 'node:events';

export class ModuleLoader extends EventEmitter<ModuleLoader.Events> {
    public readonly logger: Logger;

    constructor(public readonly client: Client) {
        super();

        this.logger = this.client.logger.clone({
            label: 'ModuleLoader'
        });
    }

    public async findModules(ignoreErrors: boolean = false): Promise<AnyModule[]> {
        const modulePaths = await ModuleLoader.scanForModules(this.client.config?.modules);
        const modules: AnyModule[] = [];

        this.emit('modulesResolving', modulePaths);

        for (const path of modulePaths) {
            try {
                this.emit('moduleResolving', path);
                const resolved = await ModuleLoader.resolveModulePath(path);

                Object.assign(resolved, { client: this.client, __$filepath: path });
                modules.push(resolved);

                this.emit('moduleResolved', resolved);
            } catch (error) {
                if (ignoreErrors) continue;

                this.emitOrThrow('moduleResolveError', new RecipleError({
                    message: `Failed to load module: ${colors.cyan(path)}`,
                    cause: error
                }));
            }
        }

        this.emit('modulesResolved', modules);
        return modules;
    }

    public static async scanForDirectories(config?: Pick<ModuleLoader.Config, 'directories'|'ignore'> & { cwd?: string; createDirectories?: boolean; }) {
        const cwd = config?.cwd ?? process.cwd();

        let scanned: string[] = [];
        let directories: string[] = [];

        for (const directory of config?.directories ?? []) {
            if (isDynamicPattern(directory, { cwd })) {
                const matches = await globby(directory, {
                    cwd,
                    ignore: config?.ignore,
                    onlyDirectories: true,
                    baseNameMatch: true,
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

        for (const directory of directories) {
            let files = await readdir(directory);

            if (config?.ignore?.length) {
                files = micromatch.not(files, config.ignore, {
                    cwd: directory,
                    matchBase: true,
                    dot: true
                });
            }

            files = files.map(f => path.join(directory, f));

            for (const file of files) {
                if (config?.filter ? !(await config?.filter(file)) : ModuleLoader.fileTypes.every(type => !file.endsWith(`.${type}`))) continue;
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

    public static async resolveSourceDirectories(options: ModuleLoader.ResolveSourceDirectoryOptions): Promise<string[]> {
        const dir = path.isAbsolute(options.baseUrl) ? options.baseUrl : path.resolve(path.join(options.cwd ?? process.cwd(), options.baseUrl));

        const root = path.resolve(path.join(dir, options.rootDir));
        const out = path.resolve(path.join(dir, options.outDir));

        return options.directories.map(directory => path.resolve(directory).replace(out, root));
    }

    private emitOrThrow<K extends keyof Pick<ModuleLoader.Events, 'moduleResolveError'>>(event: K, error: RecipleError) {
        if (this.client.listenerCount(event) > 0) {
            // @ts-expect-error
            return this.emit(event, error);
        }

        throw error;
    }
}

export namespace ModuleLoader {
    export let globby: typeof import('globby')|null = null;

    export const fileTypes = [
        'js',
        'mjs',
        'jsx'
    ];

    export interface Config {
        directories?: string[];
        ignore?: string[];
        filter?: (filepath: string) => Awaitable<boolean>;
        sort?: (a: string, b: string) => number;
    }

    export interface Events {
        moduleResolveError: [error: RecipleError];
        moduleResolved: [module: AnyModule];
        moduleResolving: [filepath: string];
        modulesResolved: [modules: AnyModule[]];
        modulesResolving: [files: string[]];
    }

    export interface ResolveSourceDirectoryOptions {
        directories: string[];
        baseUrl: string;
        rootDir: string;
        outDir: string;
        cwd?: string;
    }

    export async function getGlobby(): Promise<typeof import('globby')> {
        if (globby) return globby;

        return globby = await import('globby');
    }
}
