import type { MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction } from 'discord.js';
import { CommandPostconditionReason, CommandType } from '../../helpers/constants.js';
import { BaseCommand } from '../abstract/BaseCommand.js';
import { PreconditionResultManager } from '../managers/PreconditionResultManager.js';
import { RecipleError } from '../structures/RecipleError.js';
import { PostconditionResultManager } from '../managers/PostconditionResultManager.js';

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
        acceptRepliedInteraction?: boolean;
    }

    export async function execute({ interaction, client, command, acceptRepliedInteraction }: ExecuteOptions): Promise<ExecuteData|null> {
        if (!interaction.isContextMenuCommand()) return null;
        if ((interaction.replied || interaction.deferred) && !acceptRepliedInteraction) return null;

        command ??= client.commands.get(CommandType.ContextMenu, interaction.commandName) as ContextMenuCommand|undefined;
        if (!command) return null;

        const data: ExecuteData = {
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
