import type { ChatInputCommandInteraction } from 'discord.js';
import { CommandType } from '../../helpers/constants.js';
import { BaseCommand } from '../abstract/BaseCommand.js';
import { PreconditionResultManager } from '../managers/PreconditionResultManager.js';

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
            // TODO: Use custom error
            throw data.preconditionResults.errors[0];
        }

        if (!data.preconditionResults.hasFailures) return data;

        try {
            await command.execute(data);
        } catch (error) {
            // TODO: Use custom error
            throw new Error(error instanceof Error ? error.message : String(error));
        }

        return data;
    }
}
