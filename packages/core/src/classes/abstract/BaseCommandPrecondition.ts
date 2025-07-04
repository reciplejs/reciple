import { DiscordSnowflake } from '@sapphire/snowflake';
import type { Client } from '../structures/Client.js';
import type { CommandType } from '../../helpers/constants.js';
import type { AnyCommand, AnyCommandExecuteData } from '../../helpers/types.js';
import { RecipleError } from '../structures/RecipleError.js';

export abstract class BaseCommandPrecondition<D> implements BaseCommandPrecondition.Data<D> {
    public id: string = DiscordSnowflake.generate().toString();
    public scope: CommandType[] = [];

    public async execute<T extends CommandType>(data: AnyCommandExecuteData<T>): Promise<BaseCommandPrecondition.ResultDataResolvable<T, D>> {
        throw new RecipleError(RecipleError.Code.NotImplemented());
    }

    public toJSON(): BaseCommandPrecondition.Data<D> {
        return {
            id: this.id,
            scope: this.scope,
            execute: this.execute
        };
    }

    public static from<D>(options: BaseCommandPrecondition.Data<D>): BaseCommandPrecondition<D> {
        const instance = class extends BaseCommandPrecondition<D> {};
        Object.assign(instance.prototype, options);
        return new instance();
    }
}

export namespace BaseCommandPrecondition {
    export type Resolvable<D = any> = BaseCommandPrecondition<D>|Data<D>;

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
        precondition: BaseCommandPrecondition<D>;
        success: boolean;
        error: Error|undefined;
        message: string|undefined;
        data: D|undefined;
    }
}
