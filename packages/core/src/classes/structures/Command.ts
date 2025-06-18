import { DiscordSnowflake } from '@sapphire/snowflake';
import type { Awaitable, ChatInputApplicationCommandData, JSONEncodable, MessageApplicationCommandData, RESTPostAPIChatInputApplicationCommandsJSONBody, RESTPostAPIContextMenuApplicationCommandsJSONBody, UserApplicationCommandData } from 'discord.js';
import type { Client } from './Client.js';
import { MessageCommandBuilder } from '../builders/MessageCommandBuilder.js';
import { SlashCommandBuilder } from '../builders/SlashCommandBuilder.js';
import { ContextMenuCommandBuilder } from '../builders/ContextMenuCommandBuilder.js';

export class Command<T extends Command.Type> implements Command.Options<T> {
    public readonly id: string = DiscordSnowflake.generate().toString();
    public type!: T;
    public data!: Command.Data<T>|JSONEncodable<Command.Data<T>>;
    public execute: (data: Command.ExecuteData<T>) => Awaitable<void> = () => {};

    public constructor(options?: Partial<Command.Options<T>>) {
        if (options) Object.assign(this, options);
    }

    public setType(type: T): this {
        this.type = type;
        return this;
    }

    public setData(data: Command.Data<T>|JSONEncodable<Command.Data<T>>|((data: Command.Builder<T>) => Command.Data<T>|JSONEncodable<Command.Data<T>>)): this {
        this.data = typeof data === 'function' ? data(Command.getBuilderInstance<T>(this.type)) : data;
        return this;
    }

    public setExecute(execute: (data: Command.ExecuteData<T>) => Awaitable<void>): this {
        this.execute = execute;
        return this;
    }

    public toJSON(): Command.Options<T> {
        return {
            type: this.type,
            data: this.data,
            execute: this.execute
        };
    }
}

export namespace Command {
    export type Resolvable<T extends Type> = Command<T>|Command.Options<T>;

    export enum Type {
        Message = 1,
        Slash = 2,
        ContextMenu = 3
    }

    export interface Options<T extends Type> {
        type: T;
        data: Command.Data<T>|JSONEncodable<Command.Data<T>>;
        execute: (data: Command.ExecuteData<T>) => Awaitable<void>;
    }

    export type Data<T extends Type> = T extends Type.Message
        ? MessageCommandBuilder.Data
        : T extends Type.Slash
            ? ChatInputApplicationCommandData|RESTPostAPIChatInputApplicationCommandsJSONBody
            : T extends Type.ContextMenu
                ? UserApplicationCommandData|MessageApplicationCommandData|RESTPostAPIContextMenuApplicationCommandsJSONBody
                : never;

    export type Builder<T extends Type> = T extends Type.Message
        ? MessageCommandBuilder
        : T extends Type.Slash
            ? SlashCommandBuilder
            : T extends Type.ContextMenu
                ? ContextMenuCommandBuilder
                : never;

    export type ExecuteData<T extends Type> = T extends Type.Message
        ? MessageCommandBuilder.ExecuteData
        : T extends Type.Slash
            ? SlashCommandBuilder.ExecuteData
            : T extends Type.ContextMenu
                ? ContextMenuCommandBuilder.ExecuteData
                : never;

    export type ExecuteOptions<T extends Type> = T extends Type.Message
        ? MessageCommandBuilder.ExecuteOptions
        : T extends Type.Slash
            ? SlashCommandBuilder.ExecuteOptions
            : T extends Type.ContextMenu
                ? ContextMenuCommandBuilder.ExecuteOptions
                : never;

    export interface BaseExecuteData<T extends Type> {
        type: T;
        client: Client;
        command: Command<T>;
    }

    export interface BaseExecuteOptions<T extends Type> {
        client: Client;
        command: Command<T>;
    }

    export function getBuilderInstance<T extends Type>(type: T): Builder<T> {
        switch (type) {
            case Type.Message:
                return new MessageCommandBuilder() as Builder<T>;
            case Type.Slash:
                return new SlashCommandBuilder() as Builder<T>;
            case Type.ContextMenu:
                return new ContextMenuCommandBuilder() as Builder<T>;
        }
    }
}
