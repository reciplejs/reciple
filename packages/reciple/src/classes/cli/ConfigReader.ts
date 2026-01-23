import type { ModuleLoader } from '../client/ModuleLoader.js';
import type { ModuleManager } from '../managers/ModuleManager.js';
import type { EventListeners } from '../client/EventListeners.js';
import type { Logger } from '@prtty/print';
import { CLI } from './CLI.js';
import { Client, RecipleError, type Config } from '@reciple/core';
import type { BuildConfig } from '../../helpers/types.js';
import type { UserConfig as TsdownConfig } from 'tsdown';
import path from 'node:path';
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { resolveTSConfig } from 'pkg-types';
import { unrun, type Options as UnrunOptions } from 'unrun';
import { colors } from '@prtty/prtty';
import type { ShardingManagerOptions } from 'discord.js';

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
    private _sharding: ShardingManagerOptions|null = null;

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

    get sharding() {
        return this._sharding;
    }

    constructor(public readonly filepath: string) {}

    public async read(options?: Omit<UnrunOptions, 'path'>): Promise<ConfigReader> {
        const { module } = await unrun<Config>({
            ...options,
            path: this.filepath
        });

        if (!module || !module.client || !(module.client instanceof Client)) {
            throw new RecipleError(`exported client is not an instance of ${colors.cyan('Client')} from ${colors.green('"@reciple/core"')}.`);
        }

        this._client = module.client;
        this._config = module.config;
        this._build = module.build;
        this._sharding = module.sharding ?? null;

        return this;
    }

    public async create(options: Omit<ConfigReader.CreateOptions, 'path'>): Promise<ConfigReader> {
        const exists = await ConfigReader.exists(this.filepath);

        if (exists && options.throwIfExists === true) {
            throw new RecipleError(`Config file already exists at ${colors.green(path.relative(process.cwd(), this.filepath))}.`);
        }

        if (!exists || exists && options.overwrite !== false) {
            await mkdir(path.dirname(this.filepath), { recursive: true });
            await writeFile(this.filepath, await ConfigReader.getDefaultContent(options.type));
        }

        return options.readOptions !== false ? this.read(options.readOptions) : this;
    }

    public static async exists(file: string): Promise<boolean> {
        return await stat(file).then(s => s.isFile()).catch(() => false);
    }

    public static async create(options: ConfigReader.CreateOptions): Promise<ConfigReader> {
        return new ConfigReader(options.path).create(options);
    }

    public static async find(options?: ConfigReader.FindOptions): Promise<string|null> {
        const filenames = ConfigReader.configFilenames.filter(f => !options?.lang || f.endsWith(options.lang));
        const cwd = options?.cwd ?? process.cwd();
        const directories = [cwd];

        directories.push(...(options?.directories ?? [path.join(cwd, '.config')]));

        for (const directory of directories) {
            const stats = await stat(directory).catch(() => undefined);

            if (!stats?.isDirectory()) continue;

            const file = (await readdir(directory)).find(f => filenames.includes(f));
            if (file) return path.join(directory, file);
        }

        return null;
    }
}

export namespace ConfigReader {
    export interface CreateOptions {
        path: string;
        overwrite?: boolean;
        throwIfExists?: boolean;
        type: LangType;
        readOptions?: Omit<UnrunOptions, 'path'>|false;
    }

    export interface FindOptions {
        cwd?: string;
        lang?: LangType;
        directories?: string[];
    }

    export async function getProjectLang(cwd: string): Promise<LangType> {
        const hasTsConfig = !!await resolveTSConfig(cwd, { try: true });
        const configLangIsTypescript = !!(await ConfigReader.find({ cwd, lang: 'ts' }));

        return hasTsConfig || configLangIsTypescript ? 'ts' : 'js';
    }

    export type LangType = 'ts'|'js';

    export const defaultConfigPath = {
        ts: path.join(CLI.root, 'assets/config', `reciple.config.ts`),
        js: path.join(CLI.root, 'assets/config', `reciple.config.js`)
    };

    export async function getDefaultContent(type: LangType): Promise<string> {
        const filepath = ConfigReader.defaultConfigPath[type];
        const content = await readFile(filepath, 'utf-8');
        return content;
    }

    export const configFilenames = [
        'reciple.config.ts',
        'reciple.config.mts',
        'reciple.config.js',
        'reciple.config.mjs'
    ];

    export function createConfigFilename(type: LangType, esm: boolean = false): string {
        return `reciple.config.${esm ? 'm' : ''}${type}`;
    }

    export function normalizeTsdownConfig({ type, overrides }: { type?: LangType; overrides?: BuildConfig; } = {}): TsdownConfig {
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
}
