import { DiscordSnowflake } from '@sapphire/snowflake';
import { CommandType } from '../../helpers/constants.js';
import type { AnyCommandBuilder, AnyCommandBuilderData, AnyCommandExecuteData } from '../../helpers/types.js';
import { normalizeArray, type JSONEncodable, type RestOrArray } from 'discord.js';
import type { Client } from '../structures/Client.js';
import type { PreconditionResultManager } from '../managers/PreconditionResultManager.js';
import type { PostconditionResultManager } from '../managers/PostconditionResultManager.js';
import type { BaseCommandPrecondition } from './BaseCommandPrecondition.js';
import type { BaseCommandPostcondition } from './BaseCommandPostcondition.js';

// FIXME: Fix TypeError: Class extends value undefined is not a constructor or null
export abstract class BaseCommand<T extends CommandType> implements BaseCommand.Data<T> {
    public id: string = DiscordSnowflake.generate().toString();

    public readonly abstract type: T;
    public data!: AnyCommandBuilderData<T>;
    public cooldown?: number;
    public preconditions: BaseCommandPrecondition<any>[] = [];
    public postconditions: BaseCommandPostcondition<any>[] = [];
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

    public addPreconditions(...preconditions: RestOrArray<BaseCommandPrecondition>): this {
        this.preconditions.push(...normalizeArray(preconditions));
        return this;
    }

    public setPreconditions(...preconditions: RestOrArray<BaseCommandPrecondition>): this {
        this.preconditions = normalizeArray(preconditions);
        return this;
    }

    public addPostconditions(...postconditions: RestOrArray<BaseCommandPostcondition>): this {
        this.postconditions.push(...normalizeArray(postconditions));
        return this;
    }

    public setPostconditions(...postconditions: RestOrArray<BaseCommandPostcondition>): this {
        this.postconditions = normalizeArray(postconditions);
        return this;
    }

    public addDisabledPreconditions(...preconditions: RestOrArray<BaseCommandPrecondition.Resolvable|BaseCommandPrecondition.Resolvable['id']>): this {
        this.disabledPreconditions.push(
            ...normalizeArray(preconditions).map(precondition => typeof precondition === 'string'
                ? precondition
                : precondition.id
            )
        );
        return this;
    }

    public setDisabledPreconditions(...preconditions: RestOrArray<BaseCommandPrecondition.Resolvable|BaseCommandPrecondition.Resolvable['id']>): this {
        this.disabledPreconditions = normalizeArray(preconditions).map(precondition => typeof precondition === 'string'
            ? precondition
            : precondition.id
        );

        return this;
    }

    public addDisabledPostconditions(...postconditions: RestOrArray<BaseCommandPostcondition.Resolvable|BaseCommandPostcondition.Resolvable['id']>): this {
        this.disabledPostconditions.push(
            ...normalizeArray(postconditions).map(postcondition => typeof postcondition === 'string'
                ? postcondition
                : postcondition.id
            )
        );
        return this;
    }

    public setDisabledPostconditions(...postconditions: RestOrArray<BaseCommandPostcondition.Resolvable|BaseCommandPostcondition.Resolvable['id']>): this {
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
        preconditions?: BaseCommandPrecondition<any>[];
        postconditions?: BaseCommandPostcondition<any>[];
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

    export interface ExecuteOptions<T extends CommandType> {
        client: Client<true>;
    }
}
