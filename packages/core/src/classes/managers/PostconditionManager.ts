import { mix } from 'ts-mixer';
import { BaseManager } from '../abstract/BaseManager.js';
import type { Client } from '../structures/Client.js';
import EventEmitter from 'node:events';
import type { CommandType } from '../../helpers/constants.js';
import type { AnyCommand, AnyCommandExecuteData } from '../../helpers/types.js';
import { BaseCommandPostcondition } from '../abstract/BaseCommandPostcondition.js';
import type { PostconditionResultManager } from './PostconditionResultManager.js';
import type { BaseCommandPrecondition } from '../abstract/BaseCommandPrecondition.js';

export interface PostconditionManager extends BaseManager<string, BaseCommandPostcondition<any>, BaseCommandPostcondition.Resolvable>, EventEmitter<PostconditionManager.Events> {}

@mix(BaseManager, EventEmitter)
export class PostconditionManager {
    public readonly holds = BaseCommandPostcondition;

    constructor(public readonly client: Client, postconditions?: Iterable<BaseCommandPostcondition.Resolvable>) {
        if (postconditions) for (const postcondition of postconditions) {
            this.cache.set(postcondition.id, postcondition instanceof BaseCommandPostcondition ? postcondition : BaseCommandPostcondition.from(postcondition));
        }
    }

    public async execute<T extends CommandType, D>(options: PostconditionManager.ExecuteOptions<T, D>): Promise<PostconditionResultManager<T, D>> {
        const results = options.data.executeData.postconditionResults as PostconditionResultManager<T, D>;

        for (const postcondition of [...options.data.executeData.command.postconditions, ...(options.postconditions ?? this.cache.values())]) {
            if (
                results.postconditions.has(postcondition.id)
                || (postcondition.scope.length && !postcondition.scope.includes(options.data.executeData.command.type))
                || (postcondition.accepts.length && !postcondition.accepts.includes(options.data.reason))
                || (options.allowedPostconditions && !options.allowedPostconditions(postcondition))
            ) continue;

            results.postconditions.set(postcondition.id, postcondition);
        }

        for (const postcondition of results.postconditions.values()) {
            if (results.disabledPostconditions.includes(postcondition.id)) continue;

            const result = PostconditionManager.resolveResultData(
                options.data.executeData,
                postcondition,
                await postcondition
                    .execute(options.data, options.preconditionTrigger)
                    .catch(err => err instanceof Error ? err : new Error(String(err)))
            );

            this.emit('postconditionExecute', result);
            results.cache.set(result.id, result);

            if (options.returnOnFailure && !result.success) return results;
            if (result.error) return results;
        }

        return results;
    }
}

export namespace PostconditionManager {
    export interface Events {
        postconditionExecute: [result: BaseCommandPostcondition.ResultData<CommandType, any>];
    }

    export interface ExecuteOptions<T extends CommandType, D> {
        data: BaseCommandPostcondition.ExecuteData<T>;
        postconditions?: BaseCommandPostcondition<D>[];
        allowedPostconditions?: (postcondition: BaseCommandPostcondition<D>) => boolean;
        preconditionTrigger?: BaseCommandPrecondition.ResultData<T, any>;
        returnOnFailure?: boolean;
    }

    export function resolveResultData<T extends CommandType, D>(data: AnyCommandExecuteData<T>, postcondition: BaseCommandPostcondition<D>, result: BaseCommandPostcondition.ResultDataResolvable<T, D>): BaseCommandPostcondition.ResultData<T, D> {
        const resultData: BaseCommandPostcondition.ResultData<T, D> = {
            id: postcondition.id,
            client: data.client,
            command: data.command as AnyCommand<T>,
            executeData: data,
            postcondition,
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
