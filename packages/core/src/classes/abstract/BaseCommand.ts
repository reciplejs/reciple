import { DiscordSnowflake } from '@sapphire/snowflake';
import { CommandType } from '../../helpers/constants.js';
import type { AnyCommand, AnyCommandBuilder, AnyCommandBuilderData, AnyCommandData, AnyCommandExecuteData } from '../../helpers/types.js';
import { isJSONEncodable, type JSONEncodable } from 'discord.js';
import { SlashCommandBuilder } from '../builders/SlashCommandBuilder.js';
import { ContextMenuCommandBuilder } from '../builders/ContextMenuCommandBuilder.js';
import { MessageCommandBuilder } from '../builders/MessageCommandBuilder.js';
import type { Client } from '../structures/Client.js';
import { MessageCommand } from '../commands/MessageCommand.js';
import { SlashCommand } from '../commands/SlashCommand.js';
import { ContextMenuCommand } from '../commands/ContextMenuCommand.js';
import type { PreconditionResultManager } from '../managers/PreconditionResultManager.js';

export abstract class BaseCommand<T extends CommandType> implements BaseCommand.Data<T> {
    public id: string = DiscordSnowflake.generate().toString();

    public readonly abstract type: T;
    public data!: AnyCommandBuilderData<T>;
    public execute: (data: AnyCommandExecuteData<T>) => Promise<void> = async () => {
        // TODO: Use custom error
        throw new Error('Command not implemented');
    };

    constructor(data?: Partial<BaseCommand.Data<T>>) {
        Object.assign(this, data);
    }

    public setData(data: AnyCommandBuilderData<T>|JSONEncodable<AnyCommandBuilderData<T>>|((builder: AnyCommandBuilder<T>) => AnyCommandBuilderData<T>|JSONEncodable<AnyCommandBuilderData<T>>)): this {
        const resolved = typeof data === 'function' ? data(BaseCommand.createBuilderInstance(this.type)) : data;
        this.data = isJSONEncodable(resolved) ? resolved.toJSON() : resolved;
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
            data: this.data,
            execute: this.execute
        };
    }
}

export namespace BaseCommand {
    export interface Data<T extends CommandType> {
        id: string;
        type: T;
        data: AnyCommandBuilderData<T>;
        execute: (data: AnyCommandExecuteData<T>) => Promise<void>;
    }

    export interface ExecuteData<T extends CommandType> {
        client: Client<true>;
        command: BaseCommand<T>;
        preconditionResults: PreconditionResultManager<T>;
    }

    export interface ExecuteOptions<T extends CommandType> extends Omit<ExecuteData<T>, 'command'> {}

    export function createBuilderInstance<T extends CommandType>(type: T): AnyCommandBuilder<T> {
        switch (type) {
            case CommandType.Message:
                return new MessageCommandBuilder() as AnyCommandBuilder<T>;
            case CommandType.Slash:
                return new SlashCommandBuilder() as AnyCommandBuilder<T>;
            case CommandType.ContextMenu:
                return new ContextMenuCommandBuilder() as AnyCommandBuilder<T>;
        }
    }

    export function createInstance<T extends CommandType>(data: Omit<Partial<AnyCommandData<T>>, 'type'> & { type: T }): AnyCommand<T> {
        switch (data.type) {
            case CommandType.Message:
                return new MessageCommand(data as MessageCommand.Data) as AnyCommand<T>;
            case CommandType.Slash:
                return new SlashCommand(data as SlashCommand.Data) as AnyCommand<T>;
            case CommandType.ContextMenu:
                return new ContextMenuCommand(data as ContextMenuCommand.Data) as AnyCommand<T>;
        }
    }
}
