import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { BaseModule, CommandType, type AnyCommandData, type Config, type MessageCommand } from 'reciple';

export class RecipleRegistryCache extends BaseModule implements RecipleRegistryCache.Options {
    public createCacheEntryEvenIfDisabled: boolean = true;
    public cacheDir: string = path.join(process.cwd(), '.cache/reciple-registry/');
    public maxCacheAgeMs?: number;
    public cacheEnabledEnv: string = 'RECIPLE_REGISTRY_CACHE';
    public cached: boolean = false;

    private readonly logger = useLogger().clone({ label: 'RegistryCache' });

    constructor(options?: RecipleRegistryCache.Options) {
        super();
        Object.assign(this, options ?? {});
    }

    get cachePath(): string {
        return path.join(this.cacheDir, this.client.application?.id ?? 'cache.json');
    }

    public async onReady(): Promise<void> {
        const enabled = this.isEnabled();

        if (enabled || this.createCacheEntryEvenIfDisabled) {
            this.client.commands?.once('applicationCommandsRegister', async (commands, guildId) => {
                await this.writeCacheEntry();
            });
        }

        if (!enabled) {
            this.client.modules.on('readyModules', async () => {
                this.logger.warn(`Registry cache is disabled. Cache is not used.`);
            });

            return;
        }

        this.logger.debug('Looking for a application commands cache entry...');
        const cachedEntry = await this.readCacheEntry();

        this.logger.debug('Creating current application commands cache entry...');
        const currentEntry = await this.createCacheEntry();

        if (cachedEntry && this.isCacheHit(cachedEntry, currentEntry)) {
            this.client.config!.applicationCommandsRegister = {
                ...this.client.config!.applicationCommandsRegister,
                registerGlobally: false,
                registerToGuilds: false
            }

            this.cached = true;
        }

        this.client.modules.on('readyModules', async () => {
            this.logger.warn(`Application commands are ${this.cached ? '' : 'not '}cached. ${this.cached ? 'Skipping' : 'Proceeding with'} registration.`);
        });
    }

    public async readCacheEntry(): Promise<RecipleRegistryCache.CacheEntry|null> {
        const stats = await stat(this.cachePath).catch(() => null);
        if (!stats) return null;

        return await readFile(this.cachePath, 'utf-8').then(JSON.parse).catch(() => null);
    }

    public async writeCacheEntry(entry?: RecipleRegistryCache.CacheEntry): Promise<void> {
        entry ??= await this.createCacheEntry();

        this.logger.debug('Writing application commands cache entry...');
        await mkdir(this.cacheDir, { recursive: true });
        await writeFile(this.cachePath, JSON.stringify(entry, null, 4), 'utf-8');

        this.logger.debug(`Application commands cache entry written to "${this.cachePath}".`);
    }

    public async clearCacheEntry(): Promise<void> {
        await rm(this.cachePath).catch(() => null);
    }

    public async createCacheEntry(): Promise<RecipleRegistryCache.CacheEntry> {
        this.logger.debug('Creating current application commands cache entry...');
        const commands = Array.from(this.client.commands?.cache.filter(cmd => cmd.type !== CommandType.Message).map(cmd => cmd.toJSON()).values() ?? []);

        for (const command of commands) {
            Object.assign(command, { id: "[cache_value]" });
        }

        const commandsHash = RecipleRegistryCache.createCommandsHash(commands);
        const configHash = RecipleRegistryCache.createConfigHash(this.client.config?.applicationCommandsRegister ?? {});

        this.logger.debug(`Commands hash: ${commandsHash}`);
        this.logger.debug(`Config hash: ${configHash}`);
        this.logger.debug('Current application commands cache entry created.');

        return {
            createdAt: Date.now(),
            commandsHash,
            configHash
        };
    }

    public isCacheHit(cached: RecipleRegistryCache.CacheEntry, current: RecipleRegistryCache.CacheEntry): boolean {
        this.logger.debug('Comparing cache entry with current application commands and configuration...');
        if (this.maxCacheAgeMs) {
            const age = Date.now() - cached.createdAt;
            if (age > this.maxCacheAgeMs) {
                this.logger.debug(`Cache entry is too old (age: ${age}ms, max age: ${this.maxCacheAgeMs}ms).`);
                return false;
            }
        }

        if (cached.commandsHash !== current.commandsHash) {
            this.logger.debug(`Cache entry commands hash doesn't match (cached: ${cached.commandsHash}, current: ${current.commandsHash}).`);
            return false;
        }
        if (cached.configHash !== current.configHash) {
            this.logger.debug(`Cache entry config hash doesn't match (cached: ${cached.configHash}, current: ${current.configHash}).`);
            return false;
        }

        this.logger.debug('Cache entry matches current application commands and configuration.');
        return true;
    }

    private isEnabled(): boolean {
        if (process.env[this.cacheEnabledEnv] !== 'false' && process.env[this.cacheEnabledEnv] !== '0') {
            return RecipleRegistryCache.checkClientIfEnabled(this.client.config ?? {});
        }

        return false;
    }
}

export namespace RecipleRegistryCache {
    export interface Options {
        /**
         * @default true
         */
        createCacheEntryEvenIfDisabled?: boolean;
        /**
         * @default '.cache/reciple-registry/'
         */
        cacheDir?: string;
        /**
         * @default 86400000 // 24 hours in milliseconds
         */
        maxCacheAgeMs?: number;
        /**
         * @default 'RECIPLE_REGISTRY_CACHE'
         */
        cacheEnabledEnv?: string;
    }

    export interface CacheEntry {
        commandsHash: string;
        configHash: string;
        createdAt: number;
    }

    export type CommandData = Exclude<AnyCommandData, MessageCommand.Data>;

    export function checkClientIfEnabled(config: Config): boolean {
        return config.applicationCommandsRegister?.registerGlobally
            || config.applicationCommandsRegister?.registerToGuilds === true
            || (
                Array.isArray(config.applicationCommandsRegister?.registerToGuilds)
                && config.applicationCommandsRegister?.registerToGuilds.length > 0
            );
    }

    export function createCommandsHash(commands: Exclude<AnyCommandData, MessageCommand.Data>[]): string {
        const hash = createHash('sha256');

        hash.update(stringifyValue(commands));

        return hash.digest('hex');
    }

    export function createConfigHash(config: Config): string {
        const hash = createHash('sha256');
        const relevantConfig = { applicationCommandsRegister: config.applicationCommandsRegister };

        hash.update(stringifyValue(relevantConfig));

        return hash.digest('hex');
    }

    export function stringifyValue(object: any): string {
        switch (typeof object) {
            case 'string':
                return `"${object}"`;
            case 'number':
            case 'bigint':
            case 'boolean':
            case 'symbol':
            case 'function':
                return `"${object.toString()}"`;
            case 'undefined':
                return 'undefined';
            case 'object':
                if (object === null) {
                    return 'null';
                }

                if (Array.isArray(object)) {
                    return `[${object.map(s => stringifyValue(s)).join(', ')}]`;
                }

                if (object instanceof Map) {
                    return `{${Array.from(object.entries()).map(([k, v]) => `${stringifyValue(k)}: ${stringifyValue(v)}`).join(', ')}}`;
                }

                if (object instanceof Set) {
                    return `{${Array.from(object.values()).map(v => stringifyValue(v)).join(', ')}}`;
                }

                if (object instanceof Date) {
                    return `"${object.toISOString()}"`;
                }

                try {
                    const newObject: Record<string, string> = {};

                    for (const [key, value] of Object.entries(object)) {
                        newObject[key] = stringifyValue(value);
                    }

                    return JSON.stringify(newObject);
                } catch {
                    return String(object);
                }
        }
    }
}
