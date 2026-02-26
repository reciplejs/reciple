import type { Client } from '../structures/Client.js';
import { BaseCooldownAdapter } from '../abstract/BaseCooldownAdapter.js';
import { Collection, normalizeArray, type RestOrArray } from 'discord.js';
import { Cooldown } from '../structures/Cooldown.js';
import { resolveDate } from '@reciple/utils';
import { Where } from 'qweery';

export class CooldownAdapter extends BaseCooldownAdapter {
    public client!: Client;

    get cache(): Collection<string, Cooldown> {
        return this.client.cooldowns?.cache!;
    }

    constructor() {
        super();
    }

    public async $init(client: Client): Promise<void> {
        this.client = client;
    }

    public async fetch(filter: BaseCooldownAdapter.Filter): Promise<Cooldown.Data|null> {
        return this.fetchMany(filter).then(all => all[0] ?? null);
    }

    public async fetchMany(filter: BaseCooldownAdapter.Filter): Promise<Cooldown.Data[]> {
        return Where.filter(this.cache.values(), filter.where);
    }

    public async fetchAll(): Promise<Cooldown.Data[]> {
        return Array.from(this.cache.values());
    }

    public async delete(filter: BaseCooldownAdapter.Filter): Promise<Cooldown.Data|null> {
        const data = await this.fetch(filter);
        if (!data) return null;

        this.cache.delete(data.id);
        return data;
    }

    public async deleteMany(filter: BaseCooldownAdapter.Filter): Promise<Cooldown.Data[]> {
        const data = await this.fetchMany(filter);
        if (data.length === 0) return [];

        for (const cooldown of data) {
            this.cache.delete(cooldown.id);
        }

        return data;
    }

    public async deleteAll(): Promise<Cooldown.Data[]> {
        const data = await this.fetchAll();
        this.cache.clear();
        return data;
    }

    public async update(filter: BaseCooldownAdapter.Filter, data: Partial<Cooldown.Data>): Promise<Cooldown.Data> {
        const cooldown = await this.fetch(filter);
        if (!cooldown) throw new Error('Cooldown not found.');

        this._updateData(cooldown, data);
        return cooldown;
    }

    public async updateMany(filter: BaseCooldownAdapter.Filter, data: Partial<Cooldown.Data>): Promise<Cooldown.Data[]> {
        const cooldowns = await this.fetchMany(filter);
        if (cooldowns.length === 0) return [];

        const updated: Cooldown.Data[] = [];
        for (const cooldown of cooldowns) {
            updated.push(this._updateData(cooldown, data));
        }

        return updated;
    }

    public async updateAll(data: Partial<Cooldown.Data>): Promise<Cooldown.Data[]> {
        const cooldowns = await this.fetchAll();
        if (cooldowns.length === 0) return [];

        const updated: Cooldown.Data[] = [];
        for (const cooldown of cooldowns) {
            updated.push(this._updateData(cooldown, data));
        }

        return updated;
    }

    public async create(data: Omit<Cooldown.Data, 'id'>): Promise<Cooldown.Data> {
        const cooldown = new Cooldown(this.client, data);
        this.cache.set(cooldown.id, cooldown);
        return cooldown.toJSON();
    }

    public createMany(...data: RestOrArray<Omit<Cooldown.Data, 'id'>>): Promise<Cooldown.Data[]> {
        return Promise.all(normalizeArray(data).map(cooldown => this.create(cooldown)));
    }

    public async upsert(filter: BaseCooldownAdapter.Filter, data: { create: Cooldown.Data; update: Partial<Cooldown.Data>; }): Promise<Cooldown.Data> {
        const existing = await this.fetch(filter);

        if (existing) {
            return this.update(filter, data.update);
        } else {
            return this.create(data.create);
        }
    }

    private _updateData(data: Cooldown.Data, update: Partial<Cooldown.Data>): Cooldown.Data {
        Object.assign(data, update);
        data.endsAt = resolveDate(data.endsAt);
        return data;
    }
}
