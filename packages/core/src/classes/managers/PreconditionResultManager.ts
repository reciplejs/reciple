import { Collection, type Constructable } from 'discord.js';
import type { CommandType } from '../../helpers/constants.js';
import { BaseManager } from '../abstract/BaseManager.js';
import type { BaseCommandPrecondition } from '../abstract/BaseCommandPrecondition.js';
import type { Client } from '../structures/Client.js';

export class PreconditionResultManager<T extends CommandType, D = any> extends BaseManager<string, BaseCommandPrecondition.ResultData<T, D>, BaseCommandPrecondition.ResultData<T, D>> {
    public preconditions = new Collection<string, BaseCommandPrecondition<D>>();
    public disabledPreconditions: string[] = [];

    public constructor(client: Client, { preconditions, results, disabledPreconditions }: preconditionResultManager.Options<T, D> = {}) {
        super(client, Object as unknown as Constructable<BaseCommandPrecondition.ResultData<T, D>>);

        this.disabledPreconditions = disabledPreconditions ?? [];

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

    get postconditionData() {
        return this.cache.map(r => r.postconditionData).filter(p => !!p);
    }

    [Symbol.iterator]() {
        return this.cache[Symbol.iterator]();
    }
}

export namespace preconditionResultManager {
    export interface Options<T extends CommandType, D = any> {
        preconditions?: Iterable<BaseCommandPrecondition<D>>;
        results?: Iterable<BaseCommandPrecondition.ResultData<T, D>>;
        disabledPreconditions?: string[];
    }
}
