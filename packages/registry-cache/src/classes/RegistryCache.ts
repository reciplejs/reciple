import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { BaseModule, CommandType, type AnyCommandData, type Config, type MessageCommand } from 'reciple';

export class RegistryCache extends BaseModule implements RegistryCache.Options {
    public cacheDir: string = path.join(process.cwd(), '.cache/reciple-registry/');
    public maxCacheAgeMs?: number;
    public cacheEnabledEnv: string = 'RECIPLE_REGISTRY_CACHE';
    public cached: boolean = false;

    private readonly logger = useLogger().clone({ label: 'RegistryCache' });

    get cachePath(): string {
        return path.join(this.cacheDir, this.client.application?.id ?? 'cache.json');
    }

    public async onReady(): Promise<void> {
        if (!this.isEnabled()) return;

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

        await this.writeCacheEntry();
    }

    public async readCacheEntry(): Promise<RegistryCache.CacheEntry|null> {
        const stats = await stat(this.cachePath).catch(() => null);
        if (!stats) return null;

        return await readFile(this.cachePath, 'utf-8').then(JSON.parse).catch(() => null);
    }

    public async writeCacheEntry(entry?: RegistryCache.CacheEntry): Promise<void> {
        entry ??= await this.createCacheEntry();

        await mkdir(this.cacheDir, { recursive: true });
        await writeFile(this.cachePath, JSON.stringify(entry, null, 4), 'utf-8');
    }

    public async clearCacheEntry(): Promise<void> {
        await rm(this.cachePath).catch(() => null);
    }

    public async createCacheEntry(): Promise<RegistryCache.CacheEntry> {
        const commands = Array.from(this.client.commands?.cache.filter(cmd => cmd.type !== CommandType.Message).map(cmd => cmd.toJSON()).values() ?? []);

        for (const command of commands) {
            Object.assign(command, { id: "[cache_value]" });
        }

        const commandsHash = RegistryCache.createCommandsHash(commands);
        const configHash = RegistryCache.createConfigHash(this.client.config?.applicationCommandsRegister ?? {});

        return {
            createdAt: Date.now(),
            commandsHash,
            configHash
        };
    }

    public isCacheHit(cached: RegistryCache.CacheEntry, current: RegistryCache.CacheEntry): boolean {
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
            return RegistryCache.checkClientIfEnabled(this.client.config ?? {});
        }

        return false;
    }
}

export namespace RegistryCache {
    export interface Options {
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

        hash.update(JSON.stringify(commands.map(cmd => cmd)));

        return hash.digest('hex');
    }

    export function createConfigHash(config: Config): string {
        const hash = createHash('sha256');
        const relevantConfig = { applicationCommandsRegister: config.applicationCommandsRegister };

        hash.update(JSON.stringify(relevantConfig));

        return hash.digest('hex');
    }
}
