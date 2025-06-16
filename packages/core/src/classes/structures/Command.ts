import { DiscordSnowflake } from '@sapphire/snowflake';
import type { Awaitable, ChatInputApplicationCommandData, JSONEncodable, MessageApplicationCommandData, RESTPostAPIChatInputApplicationCommandsJSONBody, RESTPostAPIContextMenuApplicationCommandsJSONBody, UserApplicationCommandData } from 'discord.js';
import type { Client } from './Client.js';
import type { MessageCommandBuilder } from '../builders/MessageCommandBuilder.js';
import type { SlashCommandBuilder } from '../builders/SlashCommandBuilder.js';
import type { ContextMenuCommandBuilder } from '../builders/ContextMenuCommandBuilder.js';

export class Command<T extends Command.Type = Command.Type> implements Command.Options<T> {
    public readonly id: string = DiscordSnowflake.generate().toString();
    public type!: T;
    public data!: Command.Data<T>|JSONEncodable<Command.Data<T>>;
    public execute: (data: Command.ExecuteData<T>) => Awaitable<void> = () => {};

    public constructor(public readonly client: Client, options: Partial<Command.Options<T>>) {
        Object.assign(this, options);
    }

    public setType(type: T): void {
        this.type = type;
    }

    public setData(data: Command.Data<T>|JSONEncodable<Command.Data<T>>): void {
        this.data = data;
    }

    public setExecute(execute: (data: Command.ExecuteData<T>) => Awaitable<void>): void {
        this.execute = execute;
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
    export type Resolvable<T extends Type = Type> = Command<T>|Command.Options<T>;

    export enum Type {
        Message = 1,
        Slash = 2,
        ContextMenu = 3
    }

    export interface Options<T extends Type = Type> {
        type: T;
        data: Command.Data<T>|JSONEncodable<Command.Data<T>>;
        execute: (data: Command.ExecuteData<T>) => Awaitable<void>;
    }

    export type Data<T extends Type = Type> = T extends Type.Message
        ? MessageCommandBuilder.Data
        : T extends Type.Slash
            ? ChatInputApplicationCommandData|RESTPostAPIChatInputApplicationCommandsJSONBody
            : T extends Type.ContextMenu
                ? UserApplicationCommandData|MessageApplicationCommandData|RESTPostAPIContextMenuApplicationCommandsJSONBody
                : never;

    export type ExecuteData<T extends Type = Type> = T extends Type.Message
        ? MessageCommandBuilder.ExecuteData
        : T extends Type.Slash
            ? SlashCommandBuilder.ExecuteData
            : T extends Type.ContextMenu
                ? ContextMenuCommandBuilder.ExecuteData
                : never;

    export interface BaseExecuteData<T extends Type = Type> {
        type: T;
        client: Client;
    }
}
