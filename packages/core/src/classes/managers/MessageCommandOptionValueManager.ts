import { Collection } from 'discord.js';
import type { MessageCommandOption } from '../structures/MessageCommandOption.js';
import type { Client } from '../structures/Client.js';
import type { MessageCommandParser } from '../structures/MessageCommandParser.js';

export class MessageCommandOptionValueManager {
    public readonly options: Collection<string, MessageCommandOption<any>> = new Collection();

    public constructor(public readonly client: Client, options: Iterable<MessageCommandOption<any>>, public readonly parser: MessageCommandParser) {
        if (options) for (const option of options) {
            this.options.set(option.name, option);
        }
    }
}
