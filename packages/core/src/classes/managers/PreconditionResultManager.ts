import { Collection, type Constructable } from 'discord.js';
import type { CommandType } from '../../helpers/constants.js';
import { BaseManager } from '../abstract/BaseManager.js';
import type { BasePrecondition } from '../abstract/BasePrecondition.js';
import type { Client } from '../structures/Client.js';

export class PreconditionResultManager<T extends CommandType, D = any> extends BaseManager<string, BasePrecondition.ResultData<T, D>, BasePrecondition.ResultData<T, D>> {
    public preconditions = new Collection<string, BasePrecondition<D>>();

    public constructor(client: Client, { preconditions, results }: preconditionResultManager.Options<T, D> = {}) {
        super(client, Object as unknown as Constructable<BasePrecondition.ResultData<T, D>>);

        if (preconditions) for (const precondition of preconditions) {
            this.preconditions.set(precondition.id, precondition);
        }

        if (results) for (const result of results) {
            this.cache.set(result.id, result);
        }
    }

    get hasErrors() {
        return this.cache.some(r => r.error);
    }

    get hasFailures() {
        return this.hasErrors || this.cache.some(r => !r.success);
    }

    get errors() {
        return this.cache.filter(r => r.error).map(r => r.error as Error);
    }

    [Symbol.iterator]() {
        return this.cache[Symbol.iterator]();
    }
}

export namespace preconditionResultManager {
    export interface Options<T extends CommandType, D = any> {
        preconditions?: Iterable<BasePrecondition<D>>;
        results?: Iterable<BasePrecondition.ResultData<T, D>>;
    }
}
