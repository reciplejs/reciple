import { type Awaitable, type Guild, type Message } from 'discord.js';
import { CommandPostconditionReason, CommandType } from '../../helpers/constants.js';
import { BaseCommand } from '../abstract/BaseCommand.js';
import { MessageCommandOption } from '../structures/MessageCommandOption.js';
import { PreconditionResultManager } from '../managers/PreconditionResultManager.js';
import { MessageCommandOptionValueManager } from '../managers/MessageCommandOptionValueManager.js';
import { MessageCommandParser } from '../structures/MessageCommandParser.js';
import type { MessageCommandFlag } from '../structures/MessageCommandFlag.js';
import type { Client } from '../structures/Client.js';
import { RecipleError } from '../structures/RecipleError.js';
import { PostconditionResultManager } from '../managers/PostconditionResultManager.js';

export class MessageCommand extends BaseCommand<CommandType.Message> {
    public readonly type: CommandType.Message = CommandType.Message;
    public options: MessageCommandOption<any>[] = [];
    public flags: MessageCommandFlag<any>[] = [];

    public constructor(data?: Partial<MessageCommand.Data>) {
        super(data);
    }

    public toJSON(): MessageCommand.Data {
        return {
            ...super.toJSON(),
            options: this.options.map(option => option.toJSON()),
            flags: this.flags.map(flag => flag.toJSON())
        };
    }
}

export namespace MessageCommand {
    export type Resolvable = MessageCommand | MessageCommand.Data;

    export interface Data extends BaseCommand.Data<CommandType.Message> {
        options?: MessageCommandOption.Data[];
        flags?: MessageCommandFlag.Data[];
    }

    export interface ExecuteData extends BaseCommand.ExecuteData<CommandType.Message> {
        type: CommandType.Message;
        command: MessageCommand;
        message: Message;
        parser: MessageCommandParser;
        options: MessageCommandOptionValueManager;
    }

    export interface ExecuteOptions extends BaseCommand.ExecuteOptions<CommandType.Message> {
        command?: MessageCommand;
        message: Message;
        prefix?: string|((data: PerGuildStringResolveData) => Awaitable<string>);
        separator?: string|((data: PerGuildStringResolveData) => Awaitable<string>);
    }

    export interface PerGuildStringResolveData {
        guild: Guild|null;
        message: Message;
        client: Client;
    }

    export async function execute({ message, client, command, prefix, separator }: ExecuteOptions): Promise<ExecuteData|null> {
        const parser = new MessageCommandParser({
            raw: message.content,
            prefix: typeof prefix === 'function'
                ? await prefix({ guild: message.guild, message, client })
                : prefix ?? undefined,
            separator: typeof separator === 'function'
                ? await separator({ guild: message.guild, message, client })
                : separator ?? undefined
        });

        command ??= client.commands.get(CommandType.Message, parser.name) as MessageCommand|undefined;
        if (!command) return null;

        parser.parse(command);

        const data: ExecuteData = {
            type: CommandType.Message,
            message,
            client,
            command,
            parser,
            options: new MessageCommandOptionValueManager(client, command.options, parser),
            preconditionResults: new PreconditionResultManager(client, {
                disabledPreconditions: command.disabledPreconditions
            }),
            postconditionResults: new PostconditionResultManager(client, {
                disabledPostconditions: command.disabledPostconditions
            })
        };

        const result = await BaseCommand.executePreconditions(data);
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

            if (!results.cache.some(result => result.success)) {
                throw new RecipleError(RecipleError.Code.CommandExecuteError(command, error));
            }
        }

        return data;
    }
}
