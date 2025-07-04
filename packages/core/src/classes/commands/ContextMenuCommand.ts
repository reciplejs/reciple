import type { MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction } from 'discord.js';
import { CommandType } from '../../helpers/constants.js';
import { BaseCommand } from '../abstract/BaseCommand.js';
import { PreconditionResultManager } from '../managers/PreconditionResultManager.js';

export class ContextMenuCommand extends BaseCommand<CommandType.ContextMenu> {
    public readonly type: CommandType.ContextMenu = CommandType.ContextMenu;

    public constructor(data?: Partial<ContextMenuCommand.Data>) {
        super(data);
    }

    public toJSON(): ContextMenuCommand.Data {
        return super.toJSON();
    }
}

export namespace ContextMenuCommand {
    export type Resolvable = ContextMenuCommand|ContextMenuCommand.Data;

    export interface Data extends BaseCommand.Data<CommandType.ContextMenu> {}

    export interface ExecuteData extends BaseCommand.ExecuteData<CommandType.ContextMenu> {
        command: ContextMenuCommand;
        interaction: UserContextMenuCommandInteraction|MessageContextMenuCommandInteraction;
    }

    export interface ExecuteOptions extends BaseCommand.ExecuteOptions<CommandType.ContextMenu> {
        command?: ContextMenuCommand;
        interaction: UserContextMenuCommandInteraction|MessageContextMenuCommandInteraction;
    }

    export async function execute({ interaction, client, command }: ExecuteOptions): Promise<ExecuteData|null> {
        if (!interaction.isContextMenuCommand()) return null;

        command ??= client.commands.get(CommandType.ContextMenu, interaction.commandName) as ContextMenuCommand|undefined;
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
