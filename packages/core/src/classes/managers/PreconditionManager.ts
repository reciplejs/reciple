import { mix } from 'ts-mixer';
import { BaseManager } from '../abstract/BaseManager.js';
import { BaseCommandPrecondition } from '../abstract/BaseCommandPrecondition.js';
import type { Client } from '../structures/Client.js';
import EventEmitter from 'node:events';
import type { CommandType } from '../../helpers/constants.js';
import type { AnyCommand, AnyCommandExecuteData } from '../../helpers/types.js';
import { PreconditionResultManager } from './PreconditionResultManager.js';

export interface PreconditionManager extends BaseManager<string, BaseCommandPrecondition<any>, BaseCommandPrecondition.Resolvable>, EventEmitter<PreconditionManager.Events> {}

@mix(BaseManager, EventEmitter)
export class PreconditionManager {
    public readonly holds = BaseCommandPrecondition;

    constructor(public readonly client: Client, preconditions?: Iterable<BaseCommandPrecondition.Resolvable>) {
        if (preconditions) for (const precondition of preconditions) {
            this.cache.set(precondition.id, precondition instanceof BaseCommandPrecondition ? precondition : BaseCommandPrecondition.from(precondition));
        }
    }

    public async execute<T extends CommandType, D>(options: PreconditionManager.ExecuteOptions<T, D>): Promise<PreconditionResultManager<T, D>> {
        const results = options.data.preconditionResults as PreconditionResultManager<T, D>;

        for (const precondition of [...options.data.command.preconditions, ...(options.preconditions ?? this.cache.values())]) {
            if ((precondition.scope.length && !precondition.scope.includes(options.data.command.type)) || results.preconditions.has(precondition.id)) continue;

            results.preconditions.set(precondition.id, precondition);
        }

        for (const precondition of results.preconditions.values()) {
            if (results.disabledPreconditions.includes(precondition.id)) continue;

            const result = PreconditionManager.resolveResultData(
                options.data,
                precondition,
                await precondition
                    .execute(options.data)
                    .catch(err => err instanceof Error ? err : new Error(String(err)))
            );

            this.emit('preconditionExecute', result);
            results.cache.set(result.id, result);

            if (options.returnOnFailure && !result.success) return results;
            if (result.error) return results;
        }

        return results;
    }
}

export namespace PreconditionManager {
    export interface Events {
        preconditionExecute: [result: BaseCommandPrecondition.ResultData<CommandType, any>];
    }

    export interface ExecuteOptions<T extends CommandType, D> {
        data: AnyCommandExecuteData<T>;
        preconditions?: BaseCommandPrecondition<D>[];
        returnOnFailure?: boolean;
    }

    export function resolveResultData<T extends CommandType, D>(data: AnyCommandExecuteData<T>, precondition: BaseCommandPrecondition<D>, result: BaseCommandPrecondition.ResultDataResolvable<T, D>): BaseCommandPrecondition.ResultData<T, D> {
        const resultData: BaseCommandPrecondition.ResultData<T, D> = {
            id: precondition.id,
            client: data.client,
            command: data.command as AnyCommand<T>,
            executeData: data,
            precondition,
            success: false,
            error: undefined,
            message: undefined,
            data: undefined
        };

        if (result instanceof Error) {
            resultData.error = result;
            resultData.message = result.message;
        } else if (typeof result === 'string') {
            resultData.message = result;
        } else if (typeof result === 'boolean') {
            resultData.success = result;
        } else {
            Object.assign(resultData, result);
        }

        return resultData;
    }
}
