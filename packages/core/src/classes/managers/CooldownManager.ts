import { BaseManager } from '../abstract/BaseManager.js';
import type { Client } from '../structures/Client.js';
import { Cooldown } from '../structures/Cooldown.js';
import type { BaseCooldownAdapter } from '../abstract/BaseCooldownAdapter.js';
import { EventEmitter } from 'node:events';
import { mix } from 'ts-mixer';
import { Collection, isJSONEncodable, type ChannelResolvable, type GuildResolvable, type JSONEncodable, type UserResolvable } from 'discord.js';
import { resolveDate } from '@reciple/utils';

export interface CooldownManager<A extends BaseCooldownAdapter> extends BaseManager<string, Cooldown, Cooldown.Resolvable>, EventEmitter {}

@mix(BaseManager, EventEmitter)
export class CooldownManager<A extends BaseCooldownAdapter> {
    public readonly holds = Cooldown;
    public readonly cache = new Collection<string, Cooldown>();

    private _sweeper?: NodeJS.Timeout;

    constructor(public readonly client: Client, public readonly adapter: A, public readonly options?: CooldownManager.Options) {}

    public async fetch(id: string, options: { force: boolean; }): Promise<Cooldown.Data|null> {
        if (options.force !== true) {
            const cooldown = this.cache.get(id);
            if (cooldown) return cooldown;
        }

        const data = await this.adapter.fetch({ where: { id } });
        const cooldown = data ? new Cooldown(this.client, data) : null;

        if (cooldown) this.cache.set(cooldown.id, cooldown);
        return cooldown;
    }

    public async fetchForUser(user: UserResolvable, options?: Partial<Pick<Cooldown.Data, 'guildId'|'channelId'|'trigger'>>): Promise<Cooldown[]> {
        const userId = this.client.users.resolveId(user);
        if (!userId) return [];

        const data = await this.adapter.fetchMany({ where: { ...options, userId } });
        return this._parseArray(data);
    }

    public async fetchForChannel(channel: ChannelResolvable, options?: Partial<Pick<Cooldown.Data, 'guildId'|'userId'|'trigger'>>): Promise<Cooldown[]> {
        const channelId = this.client.channels.resolveId(channel);
        if (!channelId) return [];

        const data = await this.adapter.fetchMany({ where: { ...options, channelId } });
        return this._parseArray(data);
    }

    public async fetchForGuild(guild: GuildResolvable, options?: Partial<Pick<Cooldown.Data, 'userId'|'channelId'|'trigger'>>): Promise<Cooldown[]> {
        const guildId = this.client.guilds.resolveId(guild);
        if (!guildId) return [];

        const data = await this.adapter.fetchMany({ where: { ...options, guildId } });
        return this._parseArray(data);
    }

    public async create(data: Omit<Cooldown.Data, 'id'>|JSONEncodable<Omit<Cooldown.Data, 'id'>>): Promise<Cooldown> {
        const cooldown = await this.adapter.create(isJSONEncodable(data) ? data.toJSON() : data);
        this.cache.set(cooldown.id, new Cooldown(this.client, cooldown));
        return this.cache.get(cooldown.id)!;
    }

    public createSweeper(interval?: number): NodeJS.Timeout {
        if (this._sweeper) clearInterval(this._sweeper);

        return this._sweeper = setInterval(() => this.sweep(), interval ?? this.options?.sweeperOptions?.interval ?? 60000);
    }

    public async sweep(fetchAll: boolean = this.options?.sweeperOptions?.fetchAll ?? false): Promise<Cooldown[]> {
        if (fetchAll) {
            const data = await this.adapter.fetchAll();
            for (const cooldown of data) {
                this.cache.set(cooldown.id, new Cooldown(this.client, cooldown));
            }
        }

        const expired = this.cache.filter(cooldown => cooldown.isExpired);
        const deleted: Cooldown[] = [];

        for (const cooldown of expired.values()) {
            this.cache.delete(cooldown.id);
            deleted.push(cooldown);
        }

        await this.adapter.deleteMany({
            where: {
                $OR: deleted.map(cooldown => ({ id: cooldown.id }))
            },
        });

        this.emit('cooldownSweep', deleted);

        return deleted;
    }

    private _parseArray(data: Cooldown.Data[], cache: boolean = true): Cooldown[] {
        const cooldowns = data.map(data => {
            if (!cache) return new Cooldown(this.client, data);

            const cooldown = this.cache.get(data.id) ?? new Cooldown(this.client, data);
            this.cache.set(cooldown.id, this._updateCooldown(cooldown, data));
            return cooldown;
        });

        return cooldowns;
    }

    private _updateCooldown(data: Cooldown, update: Partial<Cooldown.Data>): Cooldown {
        Object.assign(data, update);
        data.endsAt = resolveDate(data.endsAt);
        return data;
    }
}

export namespace CooldownManager {
    export interface Events {
        cooldownSweep: [cooldown: Cooldown[]];
        cooldownRemove: [cooldown: Cooldown];
    }

    export interface Options {
        sweeperOptions?: {
            interval?: number;
            fetchAll?: boolean;
        };
    }
}
