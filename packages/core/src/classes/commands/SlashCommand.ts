import type { ChatInputCommandInteraction } from 'discord.js';
import { CommandType } from '../../helpers/constants.js';
import { BaseCommand } from '../abstract/BaseCommand.js';
import { PreconditionResultManager } from '../managers/PreconditionResultManager.js';
import { RecipleError } from '../structures/RecipleError.js';

export class SlashCommand extends BaseCommand<CommandType.Slash> {
    public readonly type: CommandType.Slash = CommandType.Slash;

    public constructor(data?: Partial<SlashCommand.Data>) {
        super(data);
    }

    public toJSON(): SlashCommand.Data {
        return super.toJSON();
    }
}

export namespace SlashCommand {
    export type Resolvable = SlashCommand | SlashCommand.Data;

    export interface Data extends BaseCommand.Data<CommandType.Slash> {}

    export interface ExecuteData extends BaseCommand.ExecuteData<CommandType.Slash> {
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
            interaction,
            client,
            command,
            preconditionResults: new PreconditionResultManager(client, {})
        };

        await client.preconditions.execute({ data });

        if (!data.preconditionResults.errors.length) {
            throw new RecipleError(RecipleError.Code.PreconditionError(data.preconditionResults.errors));
        }

        if (!data.preconditionResults.hasFailures) return data;

        try {
            await command.execute(data);
        } catch (error) {
            throw new RecipleError(RecipleError.Code.CommandExecuteError(command, error));
        }

        return data;
    }
}
