import { DiscordSnowflake } from '@sapphire/snowflake';
import { CommandType } from '../../helpers/constants.js';
import type { AnyCommandBuilder, AnyCommandBuilderData, AnyCommandExecuteData } from '../../helpers/types.js';
import { normalizeArray, type JSONEncodable, type RestOrArray } from 'discord.js';
import type { Client } from '../structures/Client.js';
import type { PreconditionResultManager } from '../managers/PreconditionResultManager.js';
import type { PostconditionResultManager } from '../managers/PostconditionResultManager.js';
import type { CommandPrecondition } from '../structures/CommandPrecondition.js';
import type { CommandPostcondition } from '../structures/CommandPostcondition.js';

export abstract class BaseCommand<T extends CommandType> implements BaseCommand.Data<T> {
    public id: string = DiscordSnowflake.generate().toString();

    public readonly abstract type: T;
    public data!: AnyCommandBuilderData<T>;
    public cooldown?: number;
    public preconditions: CommandPrecondition<any>[] = [];
    public postconditions: CommandPostcondition<any>[] = [];
    public disabledPreconditions: string[] = [];
    public disabledPostconditions: string[] = [];
    public execute: (data: AnyCommandExecuteData<T>) => Promise<void> = async () => {};

    constructor(data?: Partial<BaseCommand.Data<T>>) {
        Object.assign(this, data);
    }

    public abstract setCommand(data: AnyCommandBuilderData<T>|JSONEncodable<AnyCommandBuilderData<T>>|((builder: AnyCommandBuilder<T>) => AnyCommandBuilderData<T>|JSONEncodable<AnyCommandBuilderData<T>>)): this;

    public setCooldown(cooldown: number): this {
        this.cooldown = cooldown;
        return this;
    }

    public addPreconditions(...preconditions: RestOrArray<CommandPrecondition>): this {
        this.preconditions.push(...normalizeArray(preconditions));
        return this;
    }

    public setPreconditions(...preconditions: RestOrArray<CommandPrecondition>): this {
        this.preconditions = normalizeArray(preconditions);
        return this;
    }

    public addPostconditions(...postconditions: RestOrArray<CommandPostcondition>): this {
        this.postconditions.push(...normalizeArray(postconditions));
        return this;
    }

    public setPostconditions(...postconditions: RestOrArray<CommandPostcondition>): this {
        this.postconditions = normalizeArray(postconditions);
        return this;
    }

    public addDisabledPreconditions(...preconditions: RestOrArray<CommandPrecondition.Resolvable|CommandPrecondition.Resolvable['id']>): this {
        this.disabledPreconditions.push(
            ...normalizeArray(preconditions).map(precondition => typeof precondition === 'string'
                ? precondition
                : precondition.id
            )
        );
        return this;
    }

    public setDisabledPreconditions(...preconditions: RestOrArray<CommandPrecondition.Resolvable|CommandPrecondition.Resolvable['id']>): this {
        this.disabledPreconditions = normalizeArray(preconditions).map(precondition => typeof precondition === 'string'
            ? precondition
            : precondition.id
        );

        return this;
    }

    public addDisabledPostconditions(...postconditions: RestOrArray<CommandPostcondition.Resolvable|CommandPostcondition.Resolvable['id']>): this {
        this.disabledPostconditions.push(
            ...normalizeArray(postconditions).map(postcondition => typeof postcondition === 'string'
                ? postcondition
                : postcondition.id
            )
        );
        return this;
    }

    public setDisabledPostconditions(...postconditions: RestOrArray<CommandPostcondition.Resolvable|CommandPostcondition.Resolvable['id']>): this {
        this.disabledPostconditions = normalizeArray(postconditions).map(postcondition => typeof postcondition === 'string'
            ? postcondition
            : postcondition.id
        );

        return this;
    }

    public setExecute(execute: (data: AnyCommandExecuteData<T>) => Promise<void>): this {
        this.execute = execute;
        return this;
    }

    public toJSON(): BaseCommand.Data<T> {
        return {
            id: this.id,
            type: this.type,
            cooldown: this.cooldown,
            preconditions: this.preconditions,
            postconditions: this.postconditions,
            disabledPreconditions: this.disabledPreconditions,
            disabledPostconditions: this.disabledPostconditions,
            data: this.data,
            execute: this.execute
        };
    }
}

export namespace BaseCommand {
    export interface Data<T extends CommandType> {
        id: string;
        type: T;
        cooldown?: number;
        preconditions?: CommandPrecondition<any>[];
        postconditions?: CommandPostcondition<any>[];
        disabledPreconditions?: string[];
        disabledPostconditions?: string[];
        data: AnyCommandBuilderData<T>;
        execute: (data: AnyCommandExecuteData<T>) => Promise<void>;
    }

    export interface ExecuteData<T extends CommandType> {
        client: Client<true>;
        command: BaseCommand<T>;
        preconditionResults: PreconditionResultManager<T>;
        postconditionResults: PostconditionResultManager<T>;
    }

    export interface ExecuteOptions {
        client: Client<true>;
        throwOnExecuteError?: boolean;
    }
}
