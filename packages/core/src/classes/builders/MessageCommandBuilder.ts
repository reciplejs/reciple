import { normalizeArray, type RestOrArray } from 'discord.js';
import type { Command } from '../structures/Command.js';

export class MessageCommandBuilder implements MessageCommandBuilder.Data {
    public name!: string;
    public description!: string;
    public aliases: string[] = [];

    public constructor(options?: Partial<MessageCommandBuilder.Data>) {
        Object.assign(this, options);
    }

    public setName(name: string): MessageCommandBuilder {
        this.name = name;
        return this;
    }

    public setDescription(description: string): MessageCommandBuilder {
        this.description = description;
        return this;
    }

    public setAliases(aliases: RestOrArray<string>): MessageCommandBuilder {
        this.aliases = normalizeArray(aliases);
        return this;
    }

    public toJSON(): MessageCommandBuilder.Data {
        return {
            name: this.name,
            description: this.description,
            aliases: this.aliases
        };
    }
}

export namespace MessageCommandBuilder {
    export interface Data {
        name: string;
        description: string;
        aliases?: string[];
    }

    export interface ExecuteData extends Command.BaseExecuteData<Command.Type.Message> {
        command: Command<Command.Type.Message>;
    }
}
