import type { Client } from '../structures/Client.js';
import { BaseCooldownAdapter } from '../abstract/BaseCooldownAdapter.js';
import { Collection, normalizeArray, type RestOrArray } from 'discord.js';
import { Cooldown } from '../structures/Cooldown.js';
import { isDateResolvable, resolveDate } from '@reciple/utils';
import { CooldownTriggerType } from '../../helpers/constants.js';

export class CooldownAdapter extends BaseCooldownAdapter {
    get cache(): Collection<string, Cooldown> {
        return this.client.cooldowns?.cache!;
    }

    public constructor(client: Client) {
        super(client);
    }

    public async fetch(filter: BaseCooldownAdapter.Filter): Promise<Cooldown.Data | null> {
        return this._filter(filter).at(0) ?? null;
    }

    public async fetchMany(filter: BaseCooldownAdapter.Filter): Promise<Cooldown.Data[]> {
        return this._filter(filter);
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

    private _isValidWhere(data: Cooldown.Data, where: BaseCooldownAdapter.FilterWhere): boolean {
        let isValid = true;

        if (where.userId && data.userId !== where.userId) isValid = false;
        if (where.guildId && data.guildId !== where.guildId) isValid = false;
        if (where.channelId && data.channelId !== where.channelId) isValid = false;

        if (where.trigger) {
            if (where.trigger.type === data.trigger?.type) {
                if (
                    where.trigger.type === CooldownTriggerType.Command
                    && !where.trigger.commands
                        .every(
                            command =>
                                data.trigger?.type === CooldownTriggerType.Command
                                && data.trigger?.commands.some(cmd => cmd.id === command.id && cmd.type === command.type && cmd.name === command.name)
                        )
                ) {
                    isValid = false;
                }

                if (
                    where.trigger.type === CooldownTriggerType.Interaction
                    && where.trigger.interactions
                    && !where.trigger.interactions
                        ?.every(
                            interaction =>
                                data.trigger?.type === CooldownTriggerType.Interaction
                                && data.trigger?.interactions?.some(int => int.type === interaction.type && int.customId === interaction.customId && int.commandName === interaction.commandName)
                        )
                ) {
                    isValid = false;
                }
            } else {
                isValid = false;
            }
        }

        if (where.endsAt) {
            if (isDateResolvable(where.endsAt)) {
                const endsAt = resolveDate(where.endsAt);

                if (endsAt.getTime() !== data.endsAt.getTime()) isValid = false;
            } else if (typeof where.endsAt === 'object') {
                const gt = isDateResolvable(where.endsAt.gt) ? resolveDate(where.endsAt.gt) : undefined;
                const lt = isDateResolvable(where.endsAt.lt) ? resolveDate(where.endsAt.lt) : undefined;
                const gte = isDateResolvable(where.endsAt.gte) ? resolveDate(where.endsAt.gte) : undefined;
                const lte = isDateResolvable(where.endsAt.lte) ? resolveDate(where.endsAt.lte) : undefined;

                if (gt && data.endsAt.getTime() <= gt.getTime()) isValid = false;
                if (lt && data.endsAt.getTime() >= lt.getTime()) isValid = false;
                if (gte && data.endsAt.getTime() < gte.getTime()) isValid = false;
                if (lte && data.endsAt.getTime() > lte.getTime()) isValid = false;
            }
        }

        return isValid;
    }

    private _filter({ where, take, skip }: BaseCooldownAdapter.Filter): Cooldown[] {
        if (!Array.isArray(where)) where = [where];

        let collection: Cooldown[] = Array.from(this.cache.filter(data => where.some(w => this._isValidWhere(data, w))).values());

        if (skip || take) {
            skip ??= 0;
            take ??= Infinity;

            collection = collection.slice(skip, skip + take);
        }

        return collection;
    }

    private _updateData(data: Cooldown.Data, update: Partial<Cooldown.Data>): Cooldown.Data {
        Object.assign(data, update);
        data.endsAt = resolveDate(data.endsAt);
        return data;
    }
}
