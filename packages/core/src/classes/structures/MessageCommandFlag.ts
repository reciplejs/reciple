import type { Awaitable, Message } from 'discord.js';
import type { MessageCommand } from '../commands/MessageCommand.js';
import type { Client } from './Client.js';
import type { MessageCommandParser } from './MessageCommandParser.js';

export class MessageCommandFlag<T> implements MessageCommandFlag.Data<T> {
    public name!: string;
    public shortcut?: string;
    public description!: string;
    public required!: boolean;
    public multiple?: boolean;
    public default_values?: string[]|boolean[];
    public value_type?: 'string'|'boolean';
    public validate?: (data: MessageCommandFlag.ResolveValueOptions<T>) => Awaitable<void>;
    public resolve?: (data: MessageCommandFlag.ResolveValueOptions<T>) => Awaitable<T[]>;

    public constructor(data?: Partial<MessageCommandFlag.Data<T>>) {
        this.name = data?.name ?? '';
        this.shortcut = data?.shortcut;
        this.description = data?.description ?? '';
        this.required = data?.required ?? false;
        this.multiple = data?.multiple;
        this.default_values = data?.default_values;
        this.value_type = data?.value_type;
        this.validate = data?.validate;
        this.resolve = data?.resolve;
    }

    public toJSON(): MessageCommandFlag.Data<T> {
        return {
            name: this.name,
            shortcut: this.shortcut,
            description: this.description,
            required: this.required,
            multiple: this.multiple,
            default_values: this.default_values,
            value_type: this.value_type,
            validate: this.validate,
            resolve: this.resolve
        };
    }
}

export namespace MessageCommandFlag {
    export type Resolvable<T = any> = MessageCommandFlag<T>|MessageCommandFlag.Data<T>;

    export interface Data<T = any> {
        name: string;
        shortcut?: string;
        description: string;
        required: boolean;
        multiple?: boolean;
        default_values?: string[]|boolean[];
        value_type?: 'string'|'boolean';
        validate?: (data: ResolveValueOptions<T>) => Awaitable<void>;
        resolve?: (data: ResolveValueOptions<T>) => Awaitable<T[]>;
    }

    export interface BaseResolveValueOptions<V extends string|boolean, T> {
        type: V extends string ? 'string' : V extends boolean ? 'boolean' : 'string'|'boolean';
        values: V[];
        parser: MessageCommandParser;
        flag: MessageCommandFlag<T>;
        command: MessageCommand;
        message: Message;
        client: Client;
    }

    export type ResolveValueOptions<T = any> = BaseResolveValueOptions<string, T>|BaseResolveValueOptions<boolean, T>;
}
