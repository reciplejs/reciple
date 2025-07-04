import { DiscordSnowflake } from '@sapphire/snowflake';
import type { Client } from '../structures/Client.js';
import type { CommandType } from '../../helpers/constants.js';
import type { AnyCommand, AnyCommandExecuteData } from '../../helpers/types.js';
import { RecipleError } from '../structures/RecipleError.js';

export abstract class BasePrecondition<D> implements BasePrecondition.Data<D> {
    public id: string = DiscordSnowflake.generate().toString();
    public scope: CommandType[] = [];

    public async execute<T extends CommandType>(data: AnyCommandExecuteData<T>): Promise<BasePrecondition.ResultDataResolvable<T, D>> {
        throw new RecipleError(RecipleError.Code.NotImplemented());
    }

    public toJSON(): BasePrecondition.Data<D> {
        return {
            id: this.id,
            scope: this.scope,
            execute: this.execute
        };
    }

    public static from<D>(options: BasePrecondition.Data<D>): BasePrecondition<D> {
        const instance = class extends BasePrecondition<D> {};
        Object.assign(instance.prototype, options);
        return new instance();
    }
}

export namespace BasePrecondition {
    export type Resolvable<D = any> = BasePrecondition<D>|Data<D>;

    export interface Data<D> {
        id: string;
        scope: CommandType[];
        execute: <T extends CommandType>(data: AnyCommandExecuteData<T>) => Promise<ResultDataResolvable<T, D>>;
    }

    export type ResultDataResolvable<T extends CommandType, D = any> = Pick<ResultData<T, D>, 'success'|'error'|'message'|'data'>|Error|boolean|string;

    export interface ResultData<T extends CommandType, D = any> {
        id: string;
        client: Client;
        command: AnyCommand<T>;
        executeData: AnyCommandExecuteData<T>;
        precondition: BasePrecondition<D>;
        success: boolean;
        error: Error|undefined;
        message: string|undefined;
        data: D|undefined;
    }
}
