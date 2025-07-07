import { BaseManager } from '../abstract/BaseManager.js';
import type { Client } from '../structures/Client.js';
import { Cooldown } from '../structures/Cooldown.js';
import type { BaseCooldownAdapter } from '../abstract/BaseCooldownAdapter.js';
import EventEmitter from 'node:events';
import { mix } from 'ts-mixer';

export interface CooldownManager<A extends BaseCooldownAdapter> extends BaseManager<string, Cooldown, Cooldown.Resolvable>, EventEmitter {}

@mix(BaseManager, EventEmitter)
export class CooldownManager<A extends BaseCooldownAdapter> {
    public readonly holds = Cooldown;

    public constructor(public readonly client: Client, public readonly adapter: A) {}

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

    public async fetchForUser(userId: string, options: Partial<Pick<Cooldown.Data, 'guildId'|'channelId'>>): Promise<Cooldown.Data[]> {
        const data = await this.adapter.fetchMany({ where: { userId, ...options } });
        return data.map(cooldown => new Cooldown(this.client, cooldown));
    }

    public async sweep(fetchAll: boolean = false): Promise<Cooldown[]> {
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
            where: deleted.map(cooldown => ({ id: cooldown.id })),
        });

        this.emit('cooldownSweep', deleted);

        return deleted;
    }
}

export namespace CooldownManager {
    export interface Events {
        cooldownSweep: [cooldown: Cooldown[]];
        cooldownRemove: [cooldown: Cooldown];
    }
}
