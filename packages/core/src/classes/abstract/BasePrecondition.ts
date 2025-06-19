import { DiscordSnowflake } from '@sapphire/snowflake';
import type { Client } from '../structures/Client.js';
import type { CommandType } from '../../helpers/constants.js';
import type { AnyCommand, AnyCommandExecuteData } from '../../helpers/types.js';

export abstract class BasePrecondition<D> implements BasePrecondition.Options<D> {
    public id: string = DiscordSnowflake.generate().toString();
    public scope: CommandType[] = [];

    public async execute<T extends CommandType>(data: AnyCommandExecuteData<T>): Promise<BasePrecondition.ResultDataResolvable<T, D>> {
        // TODO: Use custom error
        throw new Error('Precondition not implemented');
    }

    public toJSON(): BasePrecondition.Options<D> {
        return {
            id: this.id,
            scope: this.scope,
            execute: this.execute
        };
    }

    public static from<D>(options: BasePrecondition.Options<D>): BasePrecondition<D> {
        const instance = class extends BasePrecondition<D> {};
        Object.assign(instance.prototype, options);
        return new instance();
    }
}

export namespace BasePrecondition {
    export type Resolvable<D = any> = BasePrecondition<D>|Options<D>;

    export interface Options<D> {
        id: string;
        scope: CommandType[];
        execute: <T extends CommandType>(data: AnyCommandExecuteData<T>) => Promise<ResultDataResolvable<T, D>>;
    }

    export type ResultDataResolvable<T extends CommandType, D = any> = Pick<ResultData<T, D>, 'success'|'message'|'data'>|boolean|string;

    export interface ResultData<T extends CommandType, D = any> {
        client: Client;
        command: AnyCommand<T>;
        precondition: BasePrecondition<D>;
        executeData: AnyCommandExecuteData<T>;
        success: boolean;
        message: string|undefined;
        data: D|undefined;
    }
}
