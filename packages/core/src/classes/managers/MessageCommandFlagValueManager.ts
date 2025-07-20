import { Collection, type Message } from 'discord.js';
import type { MessageCommandFlag } from '../structures/MessageCommandFlag.js';
import type { Client } from '../structures/Client.js';
import type { MessageCommandParser } from '../structures/MessageCommandParser.js';
import type { MessageCommand } from '../commands/MessageCommand.js';
import { RecipleError } from '../structures/RecipleError.js';

export class MessageCommandFlagValueManager {
    public readonly flags: Collection<string, MessageCommandFlag<any>> = new Collection();
    public readonly command: MessageCommand;
    public readonly message: Message;
    public readonly parser: MessageCommandParser;

    constructor(public readonly client: Client, options: MessageCommandFlagValueManager.Options) {
        for (const flag of options.flags) {
            this.flags.set(flag.name, flag);
        }

        this.command = options.command;
        this.message = options.message;
        this.parser = options.parser;
    }

    public getFlag<T = any>(name: string): MessageCommandFlag<T>|null {
        return this.flags.get(name) ?? null;
    }

    public getFlagValues<ReturnType extends 'string'|'boolean', Returns = ReturnType extends 'string' ? string[] : ReturnType extends 'boolean' ? boolean[] : boolean[]|string[]>(name: string, options?: { type?: ReturnType; required?: boolean; }): Returns|null;
    public getFlagValues<ReturnType extends 'string'|'boolean', Returns = ReturnType extends 'string' ? string[] : ReturnType extends 'boolean' ? boolean[] : boolean[]|string[]>(name: string, options?: { type?: ReturnType; required: true; }): Returns;
    public getFlagValues<ReturnType extends 'string'|'boolean', Returns = ReturnType extends 'string' ? string[] : ReturnType extends 'boolean' ? boolean[] : boolean[]|string[]>(name: string, options?: { type?: ReturnType; required?: boolean; }): Returns|null {
        const flag = this.getFlag(name);
        if (!flag) {
            if (!options?.required) return null;
            throw new RecipleError(RecipleError.Code.MessageCommandUnknownFlag(this.command, name));
        }

        const value = (this.parser.flags.find(f => f.name === name)?.value as Returns) ?? null;

        if (options?.required && (value === null || (Array.isArray(value) && !value.length))) {
            throw new RecipleError(RecipleError.Code.MessageCommandMissingRequiredFlag(this.command, flag));
        }

        return value;
    }

    public async getFlagResolvedValues<T = any>(name: string, required?: boolean): Promise<T[]|null>;
    public async getFlagResolvedValues<T = any>(name: string, required: true): Promise<T[]>;
    public async getFlagResolvedValues<T = any>(name: string, required?: boolean): Promise<T[]|null> {
        const flag = this.getFlag<T>(name);
        if (!flag) {
            if (!required) return null;

            throw new RecipleError(RecipleError.Code.MessageCommandUnknownFlag(this.command, name));
        }

        const values = this.getFlagValues(name);
        if (values === null || !values.length) return null;

        // @ts-expect-error
        return flag.resolve?.({
            type: flag.valueType ?? 'string',
            flag,
            client: this.client,
            command: this.command,
            message: this.message,
            parser: this.parser,
            values
        }) ?? null;
    }

    public async getInvalidFlags(): Promise<MessageCommandFlagValueManager.ValidateData[]> {
        const valid = await Promise.all(this.flags.map(f => this.validateFlag(f, this.getFlagValues(f.name))));
        return valid.filter(o => !o.valid);
    }

    public async validateFlag<T>(flag: MessageCommandFlag<T>, values: string[]|boolean[]|null): Promise<MessageCommandFlagValueManager.ValidateData<T>> {
        const data: MessageCommandFlagValueManager.ValidateData = {
            flag,
            values,
            valid: true,
            missing: false
        };

        const isEmpty = values === null || (Array.isArray(values) && !values.length);

        if (flag.required && isEmpty) {
            data.valid = false;
            data.missing = true;
            data.error = new RecipleError(RecipleError.Code.MessageCommandMissingRequiredFlag(this.command, flag));
            return data;
        }

        if (flag.validate) {
            try {
                // @ts-expect-error
                const valid = await flag.validate({
                    type: flag.valueType ?? 'string',
                    client: this.client,
                    command: this.command,
                    message: this.message,
                    flag,
                    parser: this.parser,
                    values
                });

                if (!valid) {
                    data.valid = false;
                    data.error = new RecipleError(RecipleError.Code.MessageCommandInvalidFlag(this.command, flag, `Validate function returned ${valid}`));
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

export namespace MessageCommandFlagValueManager {
    export interface Options {
        command: MessageCommand;
        message: Message;
        flags: Iterable<MessageCommandFlag<any>>;
        parser: MessageCommandParser;
    }

    export interface ValidateData<T = any> {
        flag: MessageCommandFlag<T>;
        values: string[]|boolean[]|null;
        error?: unknown;
        missing: boolean;
        valid: boolean;
    }
}
