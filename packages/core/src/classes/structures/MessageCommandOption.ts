import type { Awaitable, Message } from 'discord.js';
import type { MessageCommand } from '../commands/MessageCommand.js';
import type { Client } from './Client.js';
import type { MessageCommandParser } from './MessageCommandParser.js';

export class MessageCommandOption<T> implements MessageCommandOption.Data<T> {
    public name!: string;
    public description!: string;
    public required!: boolean;
    public validate?: (data: MessageCommandOption.ResolveValueOptions<T>) => Awaitable<boolean>;
    public resolve?: (data: MessageCommandOption.ResolveValueOptions<T>) => Awaitable<T>;

    constructor(data?: Partial<MessageCommandOption.Data<T>>) {
        this.name = data?.name ?? '';
        this.description = data?.description ?? '';
        this.required = data?.required ?? false;
        this.validate = data?.validate;
        this.resolve = data?.resolve;
    }

    public toJSON(): MessageCommandOption.Data<T> {
        return {
            name: this.name,
            description: this.description,
            required: this.required,
            validate: this.validate,
            resolve: this.resolve
        };
    }
}

export namespace MessageCommandOption {
    export type Resolvable<T = any> = MessageCommandOption<T>|MessageCommandOption.Data<T>;

    export interface Data<T = any> {
        name: string;
        description: string;
        required: boolean;
        validate?: (data: ResolveValueOptions<T>) => Awaitable<boolean>;
        resolve?: (data: ResolveValueOptions<T>) => Awaitable<T>;
    }

    export interface ResolveValueOptions<T = any> {
        value: string|null;
        parser: MessageCommandParser;
        option: MessageCommandOption<T>;
        command: MessageCommand;
        message: Message;
        client: Client;
    }
}
