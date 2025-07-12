import type { Client } from './Client.js';
import type { CommandType } from '../../helpers/constants.js';
import type { AnyCommand, AnyCommandExecuteData } from '../../helpers/types.js';
import { RecipleError } from './RecipleError.js';
import type { CommandPostcondition } from './CommandPostcondition.js';
import { DiscordSnowflake } from '@sapphire/snowflake';

export class CommandPrecondition<D = any> implements CommandPrecondition.Data<D> {
    public readonly id: string = DiscordSnowflake.generate().toString();
    public scope: CommandType[] = [];

    public async execute<T extends CommandType>(data: AnyCommandExecuteData<T>): Promise<CommandPrecondition.ResultDataResolvable<T, D>> {
        throw new RecipleError(RecipleError.Code.NotImplemented());
    }

    public toJSON(): CommandPrecondition.Data<D> {
        return {
            id: this.id,
            scope: this.scope,
            execute: this.execute
        };
    }

    public static from<D>(data: CommandPrecondition.Resolvable<D>): CommandPrecondition<D> {
        if (data instanceof CommandPrecondition) return data;

        const instance = new (class extends CommandPrecondition<D> { id = data.id; });
        Object.assign(instance, data);
        return instance;
    }
}

export namespace CommandPrecondition {
    export type Resolvable<D = any> = CommandPrecondition<D>|Data<D>;

    export interface Data<D = any> {
        id: string;
        scope?: CommandType[];
        execute: <T extends CommandType>(data: AnyCommandExecuteData<T>) => Promise<ResultDataResolvable<T, D>>;
    }

    export type ResultDataResolvable<T extends CommandType, D = any> = Pick<ResultData<T, D>, 'success'|'error'|'message'|'data'|'postconditionExecute'>|Error|boolean|string;

    export interface ResultData<T extends CommandType, D = any> {
        id: string;
        client: Client;
        command: AnyCommand<T>;
        executeData: AnyCommandExecuteData<T>;
        precondition: CommandPrecondition<D>;
        success: boolean;
        error?: Error;
        message?: string;
        data?: D;
        postconditionExecute?: {
            data: CommandPostcondition.ExecuteData<T>;
            allowedPostconditions?: (postcondition: CommandPostcondition) => boolean;
        };
    }
}
