import { Client, RecipleError, type Config } from '@reciple/core';
import { colors } from '@reciple/utils';
import { bundleRequire, type Options } from 'bundle-require';
import { CLI } from './CLI.js';
import path from 'node:path';
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import type { ModuleLoader } from './ModuleLoader.js';
import type { Logger, LoggerOptions } from 'prtyprnt';
import type { ModuleManager } from './managers/ModuleManager.js';

declare module "@reciple/core" {
    interface Config {
        token?: string;
        modules?: ModuleLoader.Config;
        logger?: Logger|LoggerOptions;
    }

    interface Client {
        readonly modules: ModuleManager;
        readonly moduleLoader: ModuleLoader;
        readonly cli: CLI;
        logger: Logger;
    }
}

export class ConfigReader {
    private _client: Client|null = null;
    private _config: Config|null = null;

    get client() {
        if (!this._client) throw new RecipleError('client is not yet loaded from config.');
        return this._client;
    }

    get config() {
        return this._config ?? {};
    }

    public constructor(public readonly filepath: string) {}

    public async read(options?: Omit<ConfigReader.ReadOptions, 'filepath'>): Promise<ConfigReader> {
        if (!await ConfigReader.hasConfigFile(this.filepath) && options?.createIfNotExists !== false) return ConfigReader.create({
            filepath: this.filepath,
            readOptions: options
        });

        const { mod } = await bundleRequire({
            format: 'esm',
            ...options,
            filepath: this.filepath
        });

        if (!mod || !mod.client || !(mod.client instanceof Client)) {
            throw new RecipleError(`exported client is not an instance of ${colors.cyan('Client')} from ${colors.green('"@reciple/core"')}.`);
        }

        this._client = mod.client;
        this._config = mod.config;

        return this;
    }

    public async create(options?: Omit<ConfigReader.CreateOptions, 'filepath'>): Promise<ConfigReader> {
        return ConfigReader.create({ ...options, filepath: this.filepath });
    }

    public static async create(options: ConfigReader.CreateOptions): Promise<ConfigReader> {
        const extention = path.extname(options.filepath).slice(1);
        const type = options.type ?? (this.isJavascriptFileExtension(extention) ? 'js' : this.isTypescriptFileExtension(extention) ? 'ts' : 'js');

        if (await ConfigReader.hasConfigFile(options.filepath) && !options.overwrite) {
            if (options.throwOnConflict !== false) throw new RecipleError(`config file already exists at ${colors.green(options.filepath)}`);

            const reader = new ConfigReader(options.filepath);
            await reader.read(options.readOptions);
            return reader;
        }

        await mkdir(path.dirname(options.filepath), { recursive: true });
        await writeFile(options.filepath, await this.getDefaultConfigContent(type));

        const reader = new ConfigReader(options.filepath);

        await reader.read(options.readOptions);
        return reader;
    }

    public async exists(): Promise<boolean> {
        return await ConfigReader.hasConfigFile(this.filepath);
    }

    public static async hasConfigFile(filepath: string): Promise<boolean> {
        const stats = await stat(filepath).catch(() => undefined);
        return !!stats;
    }

    public static async findConfigFromDirectory(directory: string, type?: 'ts'|'js'): Promise<string|null> {
        const validFiles = ConfigReader.defaultConfigFiles.filter(f => type ? ConfigReader.FileTypes[type].includes(f) : true);
        const files = (await readdir(directory)).find(f => validFiles.includes(f));
        return files ? path.join(directory, files) : null;
    }

    public static async getDefaultConfigContent(type: 'ts'|'js' = 'js'): Promise<string> {
        const filepath = ConfigReader.defaultConfigFilePaths[type];
        const content = await readFile(filepath, 'utf-8');
        return content;
    }
}

export namespace ConfigReader {
    export interface Structure {
        client: Client;
        config: Config;
    }

    export interface ReadOptions extends Options {
        createIfNotExists?: boolean;
        createOptions?: Omit<CreateOptions, 'readOptions'>;
    }

    export interface CreateOptions {
        filepath: string;
        overwrite?: boolean;
        throwOnConflict?: boolean;
        type?: 'ts' | 'js';
        readOptions?: Omit<ReadOptions, 'filepath'>;
    }

    export const FileTypes = {
        ts: ['ts', 'mts', 'tsx'],
        js: ['js', 'mjs', 'jsx']
    };

    export const defaultConfigFilePaths = {
        ts: path.join(CLI.root, 'assets/config', `reciple.config.ts`),
        js: path.join(CLI.root, 'assets/config', `reciple.config.js`)
    };

    export const defaultConfigFiles = [
        'reciple.config.ts',
        'reciple.config.mts',
        'reciple.config.js',
        'reciple.config.mjs'
    ];

    export function createConfigFilename(type: 'ts'|'js', esm: boolean = false): string {
        return `reciple.config.${type === 'ts' ? esm ? 'mts' : 'ts' : esm ? 'mjs' : 'js'}`;
    }

    export function isTypescriptFileExtension(extention: string): boolean {
        return FileTypes.ts.includes(extention);
    }

    export function isJavascriptFileExtension(extention: string): boolean {
        return FileTypes.js.includes(extention);
    }
}
