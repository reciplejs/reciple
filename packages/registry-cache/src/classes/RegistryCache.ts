import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { BaseModule, CommandType, type AnyCommand, type Config, type MessageCommand } from 'reciple';

export class RegistryCache extends BaseModule implements RegistryCache.Options {
    public cacheDir: string = path.join(process.cwd(), '.cache/reciple-registry/');
    public maxCacheAgeMs?: number;
    public cached: boolean = false;

    private readonly logger = useLogger().clone({ label: 'RegistryCache' });

    get cachePath(): string {
        return path.join(this.cacheDir, this.client.application?.id ?? 'cache.json');
    }

    public async onEnable(): Promise<void> {
        if (!this.client.config || !RegistryCache.checkClientIfEnabled(this.client.config)) return;
    }

    public async onReady(): Promise<void> {
        const cached = await this.isCached();

        this.logger.warn(`Application commands are ${this.cached ? '' : 'not '}cached. ${this.cached ? 'Skipping' : 'Proceeding with'} registration.`);

        if (cached) {
            this.client.config!.applicationCommandsRegister = {
                ...this.client.config!.applicationCommandsRegister,
                registerGlobally: false,
                registerToGuilds: false
            }

            this.cached = true;
        }

        await this.writeCacheEntry();
    }

    public async isCached(): Promise<boolean> {
        this.logger.debug('Looking for a application commands cache entry...');
        const cached = await this.readCacheEntry();
        if (!cached) return false;

        this.logger.debug('Application commands cache entry found. Verifying cache validity...');
        const current = await this.createCacheEntry();
        return this.isCacheHit(cached, current);
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
        const commands = Array.from(this.client.commands?.cache.filter(cmd => cmd.type !== CommandType.Message).values() ?? []);
        const commandsHash = RegistryCache.createCommandsHash(commands);
        const configHash = RegistryCache.createConfigHash(this.client.config ?? {});

        return {
            commandsHash,
            configHash,
            createdAt: Date.now(),
        };
    }

    public isCacheHit(cached: RegistryCache.CacheEntry, current: RegistryCache.CacheEntry): boolean {
        if (this.maxCacheAgeMs) {
            const age = Date.now() - cached.createdAt;
            if (age > this.maxCacheAgeMs) return false;
        }

        if (cached.commandsHash !== current.commandsHash) return false;
        if (cached.configHash !== current.configHash) return false;

        return true;
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

    export function createCommandsHash(commands: Exclude<AnyCommand, MessageCommand>[]): string {
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
