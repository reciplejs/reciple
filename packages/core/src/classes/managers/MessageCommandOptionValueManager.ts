import { Collection, type Message } from 'discord.js';
import type { MessageCommandOption } from '../structures/MessageCommandOption.js';
import type { Client } from '../structures/Client.js';
import type { MessageCommandParser } from '../structures/MessageCommandParser.js';
import { RecipleError } from '../structures/RecipleError.js';
import type { MessageCommand } from '../commands/MessageCommand.js';

export class MessageCommandOptionValueManager {
    public readonly options: Collection<string, MessageCommandOption<any>> = new Collection();
    public readonly command: MessageCommand;
    public readonly message: Message;
    public readonly parser: MessageCommandParser;

    public constructor(public readonly client: Client, options: MessageCommandOptionValueManager.Options) {
        for (const option of options.options) {
            this.options.set(option.name, option);
        }

        this.command = options.command;
        this.message = options.message;
        this.parser = options.parser;

        // TODO: Implement this
    }

    get optionOrder() {
        return Array.from(this.options.keys());
    }

    public getOption<T = any>(name: string): MessageCommandOption<T>|null {
        return this.options.get(name) ?? null;
    }

    public getOptionValue(name: string, required?: boolean): string|null;
    public getOptionValue(name: string, required: true): string;
    public getOptionValue(name: string, required?: boolean): string|null {
        const option = this.getOption(name);
        if (!option) {
            if (!required) return null;

            throw new RecipleError(RecipleError.Code.MessageCommandUnknownOption(this.command, name));
        }

        const index = this.optionOrder.indexOf(name);
        const value = option && index >= 0 ? this.parser.args[index] ?? null : null;

        if (required && value === null) throw new RecipleError(RecipleError.Code.MessageCommandMissingRequiredOption(this.command, option));

        return value;
    }

    public async getOptionResolvedValue<T = any>(name: string, required?: boolean): Promise<T|null>;
    public async getOptionResolvedValue<T = any>(name: string, required: true): Promise<T>;
    public async getOptionResolvedValue<T = any>(name: string, required?: boolean): Promise<T|null> {
        const option = this.getOption<T>(name);
        if (!option) {
            if (!required) return null;

            throw new RecipleError(RecipleError.Code.MessageCommandUnknownOption(this.command, name));
        }

        const value = this.getOptionValue(name, required);
        if (value === null) return null;

        return option.resolve?.({
            client: this.client,
            command: this.command,
            message: this.message,
            option,
            parser: this.parser,
            value
        }) ?? null;
    }

    public async getInvalidOptions(): Promise<MessageCommandOptionValueManager.ValidateData[]> {
        const valid = await Promise.all(this.options.map(o => this.validateOption(o, this.getOptionValue(o.name))));
        return valid.filter(o => !o.valid);
    }

    public async validateOption<T>(option: MessageCommandOption<T>, value: string|null): Promise<MessageCommandOptionValueManager.ValidateData<T>> {
        const data: MessageCommandOptionValueManager.ValidateData = {
            option,
            value,
            error: undefined,
            valid: true,
            missing: false
        };

        if (option.required && !value) {
            data.valid = false;
            data.missing = true;
            data.error = new RecipleError(RecipleError.Code.MessageCommandMissingRequiredOption(this.command, option));
            return data;
        }

        if (option.validate) {
            try {
                const valid = await option.validate({
                    client: this.client,
                    command: this.command,
                    message: this.message,
                    option,
                    parser: this.parser,
                    value
                });

                if (!valid) {
                    data.valid = false;
                    data.error = new RecipleError(RecipleError.Code.MessageCommandInvalidOption(this.command, option, `Validate function returned ${valid}`));
                }
            } catch (error) {
                data.valid = false;
                data.error = error;
                return data;
            }
        }

        return data;
    }
}

export namespace MessageCommandOptionValueManager {
    export interface Options {
        command: MessageCommand;
        message: Message;
        options: Iterable<MessageCommandOption<any>>;
        parser: MessageCommandParser;
    }

    export interface ValidateData<T = any> {
        option: MessageCommandOption<T>;
        value: string|null;
        error?: unknown;
        missing: boolean;
        valid: boolean;
    }
}
