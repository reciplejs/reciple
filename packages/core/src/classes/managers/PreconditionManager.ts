import { mix } from 'ts-mixer';
import { BaseManager } from '../abstract/BaseManager.js';
import { BasePrecondition } from '../abstract/BasePrecondition.js';
import type { Client } from '../structures/Client.js';
import EventEmitter from 'node:events';
import type { CommandType } from '../../helpers/constants.js';
import type { AnyCommand, AnyCommandExecuteData } from '../../helpers/types.js';

export interface PreconditionManager extends BaseManager<string, BasePrecondition<any>, BasePrecondition.Resolvable>, EventEmitter<PreconditionManager.Events> {}

@mix(BaseManager, EventEmitter)
export class PreconditionManager {
    public readonly holds = BasePrecondition;

    constructor(public readonly client: Client, preconditions?: Iterable<BasePrecondition.Resolvable>) {
        if (preconditions) for (const precondition of preconditions) {
            this.cache.set(precondition.id, precondition instanceof BasePrecondition ? precondition : BasePrecondition.from(precondition));
        }
    }

    public async execute<T extends CommandType, D>(data: AnyCommandExecuteData<T>, preconditions?: BasePrecondition<D>[]): Promise<BasePrecondition.ResultData<T, D>|null> {
        preconditions ??= Array.from(this.cache.values());

        for (const precondition of preconditions) {
            if (precondition.scope.length && !precondition.scope.includes(data.command.type)) continue;

            const result = PreconditionManager.resolveResultData(
                data,
                precondition,
                await precondition
                    .execute(data)
                    .catch(err => ({
                        success: false,
                        message: err instanceof Error ? err.message : String(err),
                        data: undefined
                    }))
            );

            this.emit('execute', result);
            if (!result.success) return result;
        }

        return null;
    }
}

export namespace PreconditionManager {
    export interface Events {
        execute: [result: BasePrecondition.ResultData<CommandType, any>];
    }

    export function resolveResultData<T extends CommandType, D>(data: AnyCommandExecuteData<T>, precondition: BasePrecondition<D>, result: BasePrecondition.ResultDataResolvable<T, D>): BasePrecondition.ResultData<T, D> {
        return {
            success: typeof result === 'boolean' ? result : true,
            message: typeof result === 'string' ? result : undefined,
            data: undefined,
            ...(typeof result === 'object' && result ? result : {}),
            client: data.client,
            command: data.command as AnyCommand<T>,
            precondition,
            executeData: data,
        };
    }
}
