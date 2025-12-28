import type { Client } from './Client.js';
import type { CommandPostconditionReason, CommandType } from '../../helpers/constants.js';
import type { AnyCommand, AnyCommandExecuteData } from '../../helpers/types.js';
import { RecipleError } from './RecipleError.js';
import type { Cooldown } from './Cooldown.js';
import type { PreconditionResultManager } from '../managers/PreconditionResultManager.js';
import { DiscordSnowflake } from '@sapphire/snowflake';
import type { CommandPrecondition } from './CommandPrecondition.js';
import { hasMixin } from 'ts-mixer';

export class CommandPostcondition<D = any> implements CommandPostcondition.Data<D> {
    public readonly id: string = DiscordSnowflake.generate().toString();
    public scope: CommandType[] = [];
    public accepts: CommandPostconditionReason[] = [];

    public async execute<T extends CommandType>(data: CommandPostcondition.ExecuteData<T>, preconditionTrigger?: CommandPrecondition.ResultData<T, any>): Promise<CommandPostcondition.ResultDataResolvable<T, D>> {
        throw new RecipleError(RecipleError.Code.NotImplemented());
    }

    public toJSON(): CommandPostcondition.Data<D> {
        return {
            id: this.id,
            scope: this.scope,
            execute: this.execute
        };
    }

    public static from<D>(data: CommandPostcondition.Resolvable<D>): CommandPostcondition<D> {
        if (hasMixin(data, CommandPostcondition)) return data;

        const instance = new (class extends CommandPostcondition<D> { id = data.id; });
        Object.assign(instance, data);
        return instance;
    }
}

export namespace CommandPostcondition {
    export type Resolvable<D = any> = CommandPostcondition<D>|Data<D>;

    export interface Data<D = any> {
        id: string;
        scope?: CommandType[];
        accepts?: CommandPostconditionReason[];
        execute: <T extends CommandType>(data: ExecuteData<T>, preconditionTrigger?: CommandPrecondition.ResultData<T, any>) => Promise<ResultDataResolvable<T, D>>;
    }

    export type ResultDataResolvable<T extends CommandType, D = any> = Pick<ResultData<T, D>, 'success'|'error'|'message'|'data'>|Error|boolean|string;

    export interface ResultData<T extends CommandType, D = any> {
        id: string;
        client: Client;
        command: AnyCommand<T>;
        executeData: AnyCommandExecuteData<T>;
        postcondition: CommandPostcondition<D>;
        success: boolean;
        error: Error|undefined;
        message: string|undefined;
        data: D|undefined;
    }

    export interface BaseExecuteData<T extends CommandType> {
        executeData: AnyCommandExecuteData<T>;
    }

    export type ExecuteData<T extends CommandType> = UnknownExecuteData<T>
        |ErrorExecuteData<T>
        |CooldownExecuteData<T>
        |PreconditionErrorExecuteData<T>
        |PreconditionFailureExecuteData<T>
        |InvalidArgsExecuteData<T>
        |MissingArgsExecuteData<T>
        |InvalidFlagsExecuteData<T>
        |MissingFlagsExecuteData<T>;

    export interface UnknownExecuteData<T extends CommandType> extends BaseExecuteData<T> {
        reason: CommandPostconditionReason.Unknown;
        [key: string|number|symbol]: unknown;
    }

    export interface ErrorExecuteData<T extends CommandType> extends BaseExecuteData<T> {
        reason: CommandPostconditionReason.Error;
        error: unknown;
    }

    export interface CooldownExecuteData<T extends CommandType> extends BaseExecuteData<T> {
        reason: CommandPostconditionReason.Cooldown;
        cooldown: Cooldown;
    }

    export interface PreconditionErrorExecuteData<T extends CommandType> extends BaseExecuteData<T> {
        reason: CommandPostconditionReason.PreconditionError;
        preconditionResult: PreconditionResultManager<T>;
    }

    export interface PreconditionFailureExecuteData<T extends CommandType> extends BaseExecuteData<T> {
        reason: CommandPostconditionReason.PreconditionFailure;
        preconditionResult: PreconditionResultManager<T>;
    }

    export interface InvalidArgsExecuteData<T extends CommandType> extends BaseExecuteData<T> {
        reason: CommandPostconditionReason.InvalidArgs;
    }

    export interface MissingArgsExecuteData<T extends CommandType> extends BaseExecuteData<T> {
        reason: CommandPostconditionReason.MissingArgs;
    }

    export interface InvalidFlagsExecuteData<T extends CommandType> extends BaseExecuteData<T> {
        reason: CommandPostconditionReason.InvalidFlags;
    }

    export interface MissingFlagsExecuteData<T extends CommandType> extends BaseExecuteData<T> {
        reason: CommandPostconditionReason.MissingFlags;
    }
}
