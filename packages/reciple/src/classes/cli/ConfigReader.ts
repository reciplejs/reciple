import { Client, RecipleError, type Config } from '@reciple/core';
import { colors } from '@reciple/utils';
import { CLI } from './CLI.js';
import path from 'node:path';
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import type { ModuleLoader } from '../client/ModuleLoader.js';
import type { Logger } from 'prtyprnt';
import type { ModuleManager } from '../managers/ModuleManager.js';
import type { BuildConfig } from '../../helpers/types.js';
import type { EventListeners } from '../client/EventListeners.js';
import type { UserConfig } from 'tsdown';
import { unrun, type Options } from 'unrun';
import { resolveTSConfig } from 'pkg-types';

declare module "@reciple/core" {
    interface Config {
        token?: string;
        modules?: ModuleLoader.Config;
        logger?: Logger|Logger.Options;
    }

    interface Client {
        readonly modules: ModuleManager;
        readonly moduleLoader: ModuleLoader;
        readonly eventListeners: EventListeners;
        readonly cli: CLI;
        logger: Logger;
    }
}

export class ConfigReader {
    private _client: Client|null = null;
    private _config: Config|null = null;
    private _build: BuildConfig|null = null;

    get client() {
        if (!this._client) throw new RecipleError('client is not yet loaded from config.');
        return this._client;
    }

    get config() {
        return this._config ?? {};
    }

    get build() {
        return ConfigReader.normalizeTsdownConfig({
            overrides: this._build ?? {}
        });
    }

    constructor(public readonly filepath: string) {}

    public async read(options?: Omit<ConfigReader.ReadOptions, 'filepath'>): Promise<ConfigReader> {
        if (!await ConfigReader.hasFile(this.filepath) && options?.createIfNotExists !== false) return ConfigReader.create({
            filepath: this.filepath,
            readOptions: options
        });

        const { module } = await unrun<Config>({ ...options, path: this.filepath });

        if (!module || !module.client || !(module.client instanceof Client)) {
            throw new RecipleError(`exported client is not an instance of ${colors.cyan('Client')} from ${colors.green('"@reciple/core"')}.`);
        }

        this._client = module.client;
        this._config = module.config;
        this._build = module.build;

        return this;
    }

    public async create(options?: Omit<ConfigReader.CreateOptions, 'filepath'>): Promise<ConfigReader> {
        return ConfigReader.create({ ...options, filepath: this.filepath });
    }

    public async exists(): Promise<boolean> {
        return await ConfigReader.hasFile(this.filepath);
    }

    public static async create(options: ConfigReader.CreateOptions): Promise<ConfigReader> {
        const type = options.type ?? ConfigReader.getLangTypeFromFilename(options.filepath) ?? 'js';

        if (await ConfigReader.hasFile(options.filepath) && !options.overwrite) {
            if (options.throwOnConflict !== false) throw new RecipleError(`config file already exists at ${colors.green(options.filepath)}`);

            const reader = new ConfigReader(options.filepath);
            await reader.read(options.readOptions);
            return reader;
        }

        await mkdir(path.dirname(options.filepath), { recursive: true });
        await writeFile(options.filepath, await this.getDefaultContent(type));

        const reader = new ConfigReader(options.filepath);

        return reader;
    }

    public static async hasFile(filepath: string): Promise<boolean> {
        return stat(filepath)
            .then(s => s.isFile())
            .catch(() => false);
    }

    public static async findConfig(directory: string, type?: 'ts'|'js'): Promise<string|null> {
        const validFiles = ConfigReader.defaultConfigFilenames.filter(f => type ? ConfigReader.FileTypes[type].includes(f) : true);
        const files = (await readdir(directory)).find(f => validFiles.includes(f));
        return files ? path.join(directory, files) : null;
    }

    public static async getDefaultContent(type: 'ts'|'js' = 'js'): Promise<string> {
        const filepath = ConfigReader.defaultConfigFilePaths[type];
        const content = await readFile(filepath, 'utf-8');
        return content;
    }
}

export namespace ConfigReader {
    export async function getProjectLang(dir: string): Promise<'ts'|'js'> {
        const hasTsConfig = !!await resolveTSConfig(dir, { try: true });
        const configLangIsTypescript = (await ConfigReader.findConfig(dir).then(f => f ?? '')).endsWith('ts');

        return hasTsConfig || configLangIsTypescript ? 'ts' : 'js';
    }

    export interface Structure {
        client: Client;
        config: Config;
    }

    export interface ReadOptions extends Options {
        createIfNotExists?: boolean;
        createOptions?: Omit<CreateOptions, 'path'>;
    }

    export interface CreateOptions {
        filepath: string;
        overwrite?: boolean;
        throwOnConflict?: boolean;
        type?: 'ts' | 'js';
        readOptions?: Omit<ReadOptions, ''>;
    }

    export const FileTypes = {
        ts: ['ts', 'mts', 'tsx'],
        js: ['js', 'mjs', 'jsx']
    };

    export const defaultConfigFilePaths = {
        ts: path.join(CLI.root, 'assets/config', `reciple.config.ts`),
        js: path.join(CLI.root, 'assets/config', `reciple.config.js`)
    };

    export const defaultConfigFilenames = [
        'reciple.config.ts',
        'reciple.config.mts',
        'reciple.config.js',
        'reciple.config.mjs'
    ];

    export function normalizeTsdownConfig({ type, overrides }: { type?: 'ts' | 'js', overrides?: BuildConfig; } = {}): UserConfig {
        return {
            entry: [`./src/**/*.{ts,tsx,js,jsx}`],
            outDir: './modules',
            tsconfig: `./${type ?? 'ts'}config.json`,
            external: [],
            noExternal: [],
            sourcemap: true,
            treeshake: true,
            clean: true,
            ...overrides,
            watch: false,
            platform: 'node',
            format: 'esm',
            unbundle: true,
            skipNodeModulesBundle: true
        };
    }

    export function createConfigFilename(type: 'ts'|'js', esm: boolean = false): string {
        return `reciple.config.${type === 'ts' ? esm ? 'mts' : 'ts' : esm ? 'mjs' : 'js'}`;
    }

    export function getLangTypeFromFilename(filename: string): 'ts'|'js'|null {
        const extention = path.extname(filename).slice(1);

        if (FileTypes.ts.includes(extention)) return 'ts';
        if (FileTypes.js.includes(extention)) return 'js';
        return null;
    }
}
