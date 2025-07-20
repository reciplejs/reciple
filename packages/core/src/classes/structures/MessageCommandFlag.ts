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
    public defaultValues?: string[]|boolean[];
    public valueType?: 'string'|'boolean';
    public validate?: (data: MessageCommandFlag.ResolveValueOptions<T>) => Awaitable<boolean>;
    public resolve?: (data: MessageCommandFlag.ResolveValueOptions<T>) => Awaitable<T[]>;

    constructor(data?: Partial<MessageCommandFlag.Data<T>>) {
        this.name = data?.name ?? '';
        this.shortcut = data?.shortcut;
        this.description = data?.description ?? '';
        this.required = data?.required ?? false;
        this.multiple = data?.multiple;
        this.defaultValues = data?.defaultValues;
        this.valueType = data?.valueType;
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
            defaultValues: this.defaultValues,
            valueType: this.valueType,
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
        defaultValues?: string[]|boolean[];
        valueType?: 'string'|'boolean';
        validate?: (data: ResolveValueOptions<T>) => Awaitable<boolean>;
        resolve?: (data: ResolveValueOptions<T>) => Awaitable<T[]>;
    }

    export interface BaseResolveValueOptions<V extends string|boolean, T> {
        type: V extends string ? 'string' : V extends boolean ? 'boolean' : 'string'|'boolean';
        values: V[]|null;
        parser: MessageCommandParser;
        flag: MessageCommandFlag<T>;
        command: MessageCommand;
        message: Message;
        client: Client;
    }

    export type ResolveValueOptions<T = any> = BaseResolveValueOptions<string, T>|BaseResolveValueOptions<boolean, T>;
}
