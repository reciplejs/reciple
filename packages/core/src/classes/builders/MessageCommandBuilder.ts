import { normalizeArray, type JSONEncodable, type RestOrArray } from 'discord.js';
import type { MessageCommandOption } from '../structures/MessageCommandOption.js';
import { MessageCommandOptionBuilder } from './MessageCommandOptionBuilder.js';
import type { MessageCommandFlag } from '../structures/MessageCommandFlag.js';
import { MessageCommandBuilderValidator } from '../validators/MessageCommandBuilderValidator.js';
import { MessageCommandOptionValidator } from '../validators/MessageCommandOptionValidator.js';
import { MessageCommandFlagValidator } from '../validators/MessageCommandFlagValidator.js';
import { MessageCommandFlagBuilder } from './MessageCommandFlagBuilder.js';

export class MessageCommandBuilder implements Omit<MessageCommandBuilder.Data, 'options'|'flags'> {
    public name!: string;
    public description!: string;
    public aliases: string[] = [];
    public options: JSONEncodable<MessageCommandOption.Data>[] = [];
    public flags: JSONEncodable<MessageCommandFlag.Data>[] = [];

    public constructor(options?: Partial<MessageCommandBuilder.Data>) {
        MessageCommandBuilderValidator.object
            .partial()
            .optional()
            .setValidationEnabled(MessageCommandBuilderValidator.isValidationEnabled)
            .parse(options);

        Object.assign(this, options);
    }

    public setName(name: string): this {
        MessageCommandBuilderValidator.isValidName(name);
        this.name = name;
        return this;
    }

    public setDescription(description: string): this {
        MessageCommandBuilderValidator.isValidDescription(description);
        this.description = description;
        return this;
    }

    public setAliases(...aliases: RestOrArray<string>): this {
        const values = normalizeArray(aliases);

        MessageCommandBuilderValidator.isValidAliases(values);
        this.aliases = values;
        return this;
    }

    public addOption<T>(option: JSONEncodable<MessageCommandOption.Data<T>>|((builder: MessageCommandOptionBuilder<T>) => JSONEncodable<MessageCommandOption.Data<T>>)): this {
        const resolved = typeof option === 'function' ? option(new MessageCommandOptionBuilder()) : option;

        MessageCommandOptionValidator.isValid(resolved);
        this.options.push(resolved);
        return this;
    }

    public addFlag<T>(flag: JSONEncodable<MessageCommandFlag.Data<T>>|((builder: MessageCommandFlagBuilder<T>) => JSONEncodable<MessageCommandFlag.Data<T>>)): this {
        const resolved = typeof flag === 'function' ? flag(new MessageCommandFlagBuilder()) : flag;

        MessageCommandFlagValidator.isValid(resolved);
        this.flags.push(resolved);
        return this;
    }

    public toJSON(): MessageCommandBuilder.Data {
        return {
            name: this.name,
            description: this.description,
            aliases: this.aliases,
            options: this.options.map(o => o.toJSON()),
            flags: this.flags.map(f => f.toJSON())
        };
    }
}

export namespace MessageCommandBuilder {
    export interface Data {
        name: string;
        description: string;
        aliases?: string[];
        options?: MessageCommandOption.Data[];
        flags?: MessageCommandFlag.Data[];
    }
}
