import { Collection, type Constructable } from 'discord.js';
import type { CommandType } from '../../helpers/constants.js';
import { BaseManager } from '../abstract/BaseManager.js';
import type { CommandPrecondition } from '../structures/CommandPrecondition.js';
import type { Client } from '../structures/Client.js';

export class PreconditionResultManager<T extends CommandType, D = any> extends BaseManager<string, CommandPrecondition.ResultData<T, D>, CommandPrecondition.ResultData<T, D>> {
    public preconditions = new Collection<string, CommandPrecondition<D>>();
    public disabledPreconditions: string[] = [];

    constructor(client: Client, { preconditions, results, disabledPreconditions }: preconditionResultManager.Options<T, D> = {}) {
        super(client, Object as unknown as Constructable<CommandPrecondition.ResultData<T, D>>);

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

    get postconditionExecutes() {
        return this.cache.filter(r => !!r.postconditionExecute).map(r => r.postconditionExecute);
    }

    [Symbol.iterator]() {
        return this.cache[Symbol.iterator]();
    }
}

export namespace preconditionResultManager {
    export interface Options<T extends CommandType, D = any> {
        preconditions?: Iterable<CommandPrecondition<D>>;
        results?: Iterable<CommandPrecondition.ResultData<T, D>>;
        disabledPreconditions?: string[];
    }
}
