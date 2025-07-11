import type { DateResolvable, RestOrArray } from 'discord.js';
import type { Client } from '../structures/Client.js';
import type { Cooldown } from '../structures/Cooldown.js';

export abstract class BaseCooldownAdapter {
    public constructor(public readonly client: Client) {}

    public abstract fetch(filter: BaseCooldownAdapter.Filter): Promise<Cooldown.Data|null>;
    public abstract fetchMany(filter: BaseCooldownAdapter.Filter): Promise<Cooldown.Data[]>;
    public abstract fetchAll(): Promise<Cooldown.Data[]>;

    public abstract delete(filter: BaseCooldownAdapter.Filter): Promise<Cooldown.Data|null>;
    public abstract deleteMany(filter: BaseCooldownAdapter.Filter): Promise<Cooldown.Data[]>;
    public abstract deleteAll(): Promise<Cooldown.Data[]>;

    public abstract update(filter: BaseCooldownAdapter.Filter, data: Partial<Cooldown.Data>): Promise<Cooldown.Data>;
    public abstract updateMany(filter: BaseCooldownAdapter.Filter, data: Partial<Cooldown.Data>): Promise<Cooldown.Data[]>;
    public abstract updateAll(data: Partial<Cooldown.Data>): Promise<Cooldown.Data[]>;

    public abstract create(data: Omit<Cooldown.Data, 'id'>): Promise<Cooldown.Data>;
    public abstract createMany(...data: RestOrArray<Omit<Cooldown.Data, 'id'>>): Promise<Cooldown.Data[]>;

    public abstract upsert(filter: BaseCooldownAdapter.Filter, data: { create: Cooldown.Data; update: Partial<Cooldown.Data>; }): Promise<Cooldown.Data>;
}

export namespace BaseCooldownAdapter {
    export type Constructor = new (client: Client) => BaseCooldownAdapter;

    export interface Filter {
        where: FilterWhere|FilterWhere[];
        take?: number;
        skip?: number;
    }

    export interface FilterWhere extends Partial<Omit<Cooldown.Data, 'endsAt'>> {
        endsAt?: DateResolvable|{
            gt?: DateResolvable;
            gte?: DateResolvable;
            lt?: DateResolvable;
            lte?: DateResolvable;
        };
    }
}
