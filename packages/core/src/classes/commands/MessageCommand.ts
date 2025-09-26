import { isJSONEncodable, type Awaitable, type Guild, type JSONEncodable, type Message } from 'discord.js';
import { CommandPostconditionReason, CommandType } from '../../helpers/constants.js';
import { BaseCommand } from '../abstract/BaseCommand.js';
import { MessageCommandOption } from '../structures/MessageCommandOption.js';
import { PreconditionResultManager } from '../managers/PreconditionResultManager.js';
import { MessageCommandOptionValueManager } from '../managers/MessageCommandOptionValueManager.js';
import { MessageCommandParser } from '../structures/MessageCommandParser.js';
import { MessageCommandFlag } from '../structures/MessageCommandFlag.js';
import type { Client } from '../structures/Client.js';
import { RecipleError } from '../structures/RecipleError.js';
import { PostconditionResultManager } from '../managers/PostconditionResultManager.js';
import { MessageCommandFlagValueManager } from '../managers/MessageCommandFlagValueManager.js';
import { Utils } from '../structures/Utils.js';
import { MessageCommandBuilder } from '../builders/MessageCommandBuilder.js';
import { MessageCommandValidator } from '../validators/MessageCommandValidator.js';

export class MessageCommand extends BaseCommand<CommandType.Message> {
    public readonly type: CommandType.Message = CommandType.Message;

    public async execute(data: MessageCommand.ExecuteData): Promise<void> {}

    get options() {
        return this.data.options?.map(o => o instanceof MessageCommandOption ? o : new MessageCommandOption(o)) ?? [];
    }

    get flags() {
        return this.data.flags?.map(f => f instanceof MessageCommandFlag ? f : new MessageCommandFlag(f)) ?? [];
    }

    constructor(data?: Partial<MessageCommand.Data>) {
        super(data);
    }

    public setCommand(data: MessageCommandBuilder.Data|JSONEncodable<MessageCommandBuilder.Data>|((builder: MessageCommandBuilder) => MessageCommandBuilder.Data|JSONEncodable<MessageCommandBuilder.Data>)): this {
        let resolved = typeof data === 'function' ? data(new MessageCommandBuilder()) : data;
            resolved = isJSONEncodable(resolved) ? resolved.toJSON() : resolved;

        MessageCommandValidator.isValid(resolved);
        this.data = resolved;
        return this;
    }

    public toJSON(): MessageCommand.Data {
        return super.toJSON();
    }
}

export namespace MessageCommand {
    export type Resolvable = MessageCommand | MessageCommand.Data;

    export interface Data extends BaseCommand.Data<CommandType.Message> {}

    export interface ExecuteData extends BaseCommand.ExecuteData<CommandType.Message> {
        type: CommandType.Message;
        command: MessageCommand;
        message: Message;
        parser: MessageCommandParser;
        options: MessageCommandOptionValueManager;
        flags: MessageCommandFlagValueManager;
    }

    export interface ExecuteOptions extends BaseCommand.ExecuteOptions {
        command?: MessageCommand;
        message: Message;
        prefix?: string|((data: PerGuildStringResolveData) => Awaitable<string>);
        separator?: string|((data: PerGuildStringResolveData) => Awaitable<string>);
        splitOptions?: Omit<MessageCommandParser.SplitOptions, 'separator'>;
    }

    export interface PerGuildStringResolveData {
        guild: Guild|null;
        message: Message;
        client: Client;
    }

    export async function execute({ message, client, command, prefix, separator, throwOnExecuteError, splitOptions }: ExecuteOptions): Promise<ExecuteData|null> {
        const parser = new MessageCommandParser({
            raw: message.content,
            prefix: typeof prefix === 'function'
                ? await prefix({ guild: message.guild, message, client })
                : prefix ?? undefined,
            separator: typeof separator === 'function'
                ? await separator({ guild: message.guild, message, client })
                : separator ?? undefined,
            splitOptions
        });

        command ??= client.commands.cache.find(c => c.type === CommandType.Message && (c.data.name === parser.name || c.data.aliases?.includes(parser.name))) as MessageCommand|undefined;
        if (!command) return null;

        parser.parse(command);

        const data: ExecuteData = {
            type: CommandType.Message,
            message,
            client,
            command,
            parser,
            options: new MessageCommandOptionValueManager(client, {
                command,
                message,
                options: command.options,
                parser
            }),
            flags: new MessageCommandFlagValueManager(client, {
                command,
                message,
                flags: command.flags,
                parser
            }),
            preconditionResults: new PreconditionResultManager(client, {
                disabledPreconditions: command.disabledPreconditions
            }),
            postconditionResults: new PostconditionResultManager(client, {
                disabledPostconditions: command.disabledPostconditions
            })
        };

        const result = await Utils.executeCommandPreconditions(data);
        if (result) return data;

        try {
            await command.execute(data);
        } catch (error) {
            const results = await client.postconditions.execute({
                data: {
                    reason: CommandPostconditionReason.Error,
                    executeData: data,
                    error
                }
            });

            if (!results.cache.some(result => result.success) && throwOnExecuteError) {
                throw new RecipleError(RecipleError.Code.CommandExecuteError(command, error));
            } else {
                return null;
            }
        }

        data.client.commands.emit('commandExecute', data);
        return data;
    }
}
