import { Collection, type Constructable } from 'discord.js';
import type { Client } from '../structures/Client.js';
import { hasMixin } from 'ts-mixer';

export abstract class BaseManager<K extends string, V extends { id: string; }, R> {
    public readonly cache: Collection<K, V> = new Collection();

    public constructor(public readonly client: Client, public readonly holds: Constructable<V>) {}

    public resolve(resolvable: R|K): V|null;
    public resolve(resolvable: V): V;
    public resolve(resolvable: R|V|K): V|null {
        if (resolvable instanceof this.holds) return resolvable;
        if (typeof resolvable === 'string') return this.cache.get(resolvable as K) ?? null;
        if (typeof resolvable === 'object' && resolvable && 'id' in resolvable) return this.cache.get(resolvable.id as K) ?? null;

        return null;
    }

    public resolveId(resolvable: R|K): string|null;
    public resolveId(resolvable: V): string;
    public resolveId(resolvable: R|V|K): string|null {
        if ((typeof resolvable === 'object' && resolvable && 'id' in resolvable) || resolvable instanceof this.holds || hasMixin(resolvable, this.holds)) return resolvable.id;
        if (typeof resolvable === 'string') return resolvable;

        return null;
    }

    public valueOf() {
        return this.cache;
    }
}
