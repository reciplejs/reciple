import { Collection, type Constructable } from 'discord.js';
import type { CommandType } from '../../helpers/constants.js';
import { BaseManager } from '../abstract/BaseManager.js';
import type { Client } from '../structures/Client.js';
import type { CommandPostcondition } from '../structures/CommandPostcondition.js';

export class PostconditionResultManager<T extends CommandType, D = any> extends BaseManager<string, CommandPostcondition.ResultData<T, D>, CommandPostcondition.ResultData<T, D>> {
    public postconditions = new Collection<string, CommandPostcondition<D>>();
    public disabledPostconditions: string[] = [];

    public constructor(client: Client, { postconditions, results, disabledPostconditions }: PostconditionResultManager.Options<T, D> = {}) {
        super(client, Object as unknown as Constructable<CommandPostcondition.ResultData<T, D>>);

        this.disabledPostconditions = disabledPostconditions ?? [];

        if (postconditions) for (const postcondition of postconditions) {
            this.postconditions.set(postcondition.id, postcondition);
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

export namespace PostconditionResultManager {
    export interface Options<T extends CommandType, D = any> {
        postconditions?: Iterable<CommandPostcondition<D>>;
        results?: Iterable<CommandPostcondition.ResultData<T, D>>;
        disabledPostconditions?: string[];
    }
}
