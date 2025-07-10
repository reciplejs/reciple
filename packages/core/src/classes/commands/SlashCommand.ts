import { isJSONEncodable, type ChatInputCommandInteraction, type JSONEncodable } from 'discord.js';
import { CommandPostconditionReason, CommandType } from '../../helpers/constants.js';
import { BaseCommand } from '../abstract/BaseCommand.js';
import { PreconditionResultManager } from '../managers/PreconditionResultManager.js';
import { RecipleError } from '../structures/RecipleError.js';
import { PostconditionResultManager } from '../managers/PostconditionResultManager.js';
import { Utils } from '../structures/Utils.js';
import { SlashCommandBuilder } from '../builders/SlashCommandBuilder.js';

export class SlashCommand extends BaseCommand<CommandType.Slash> {
    public readonly type: CommandType.Slash = CommandType.Slash;

    public constructor(data?: Partial<SlashCommand.Data>) {
        super(data);
    }

    public setCommand(data: SlashCommandBuilder.Data|JSONEncodable<SlashCommandBuilder.Data>|((builder: SlashCommandBuilder) => SlashCommandBuilder.Data|JSONEncodable<SlashCommandBuilder.Data>)): this {
        const resolved = typeof data === 'function' ? data(new SlashCommandBuilder()) : data;
        this.data = isJSONEncodable(resolved) ? resolved.toJSON() : resolved;
        return this;
    }

    public toJSON(): SlashCommand.Data {
        return super.toJSON();
    }
}

export namespace SlashCommand {
    export type Resolvable = SlashCommand | SlashCommand.Data;

    export interface Data extends BaseCommand.Data<CommandType.Slash> {}

    export interface ExecuteData extends BaseCommand.ExecuteData<CommandType.Slash> {
        type: CommandType.Slash;
        command: SlashCommand;
        interaction: ChatInputCommandInteraction;
    }

    export interface ExecuteOptions extends BaseCommand.ExecuteOptions<CommandType.Slash> {
        command?: SlashCommand;
        interaction: ChatInputCommandInteraction;
        acceptRepliedInteraction?: boolean;
    }

    export async function execute({ interaction, client, command, acceptRepliedInteraction }: ExecuteOptions): Promise<ExecuteData|null> {
        if (!interaction.isChatInputCommand()) return null;
        if ((interaction.replied || interaction.deferred) && !acceptRepliedInteraction) return null;

        command ??= client.commands.get(CommandType.Slash,interaction.commandName) as SlashCommand|undefined;
        if (!command) return null;

        const data: ExecuteData = {
            type: CommandType.Slash,
            interaction,
            client,
            command,
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

            if (!results.cache.some(result => result.success)) {
                throw new RecipleError(RecipleError.Code.CommandExecuteError(command, error));
            }
        }

        return data;
    }
}
