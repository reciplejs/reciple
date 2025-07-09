import { Collection, type Message } from 'discord.js';
import type { MessageCommandFlag } from '../structures/MessageCommandFlag.js';
import type { Client } from '../structures/Client.js';
import type { MessageCommandParser } from '../structures/MessageCommandParser.js';
import type { MessageCommand } from '../commands/MessageCommand.js';

export class MessageCommandFlagValueManager {
    public readonly flags: Collection<string, MessageCommandFlag<any>> = new Collection();
    public readonly command: MessageCommand;
    public readonly message: Message;
    public readonly parser: MessageCommandParser;

    public constructor(public readonly client: Client, options: MessageCommandFlagValueManager.Options) {
        for (const flag of options.flags) {
            this.flags.set(flag.name, flag);
        }

        this.command = options.command;
        this.message = options.message;
        this.parser = options.parser;

        // TODO: Implement this
    }

    public getFlag<T = any>(name: string): MessageCommandFlag<T>|null {
        return this.flags.get(name) ?? null;
    }

    public getFlagValues<R extends 'string'|'boolean', T = R extends 'string' ? string[] : R extends 'boolean' ? boolean[] : boolean[]|string[]>(name: string, type?: R): T|null {
        return (this.parser.flags.find(f => f.name === name)?.value as T) ?? null;
    }

    public async getFlagResolvedValues<T = any>(name: string): Promise<T[]|null> {
        const flag = this.getFlag<T>(name);
        if (!flag) return null;

        const values = this.getFlagValues(name);
        if (!values) return null;

        // @ts-expect-error
        return flag.resolve?.({
            type: flag.value_type ?? 'string',
            flag,
            client: this.client,
            command: this.command,
            message: this.message,
            parser: this.parser,
            values
        }) ?? null;
    }
}

export namespace MessageCommandFlagValueManager {
    export interface Options {
        command: MessageCommand;
        message: Message;
        flags: Iterable<MessageCommandFlag<any>>;
        parser: MessageCommandParser;
    }
}
