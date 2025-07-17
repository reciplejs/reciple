import { isJSONEncodable, type JSONEncodable, type MessageContextMenuCommandInteraction, type UserContextMenuCommandInteraction } from 'discord.js';
import { PostconditionResultManager } from '../managers/PostconditionResultManager.js';
import { CommandPostconditionReason, CommandType } from '../../helpers/constants.js';
import { PreconditionResultManager } from '../managers/PreconditionResultManager.js';
import { ContextMenuCommandBuilder } from '../builders/ContextMenuCommandBuilder.js';
import { BaseCommand } from '../abstract/BaseCommand.js';
import { RecipleError } from '../structures/RecipleError.js';
import { Utils } from '../structures/Utils.js';

export class ContextMenuCommand extends BaseCommand<CommandType.ContextMenu> {
    public readonly type: CommandType.ContextMenu = CommandType.ContextMenu;

    public constructor(data?: Partial<ContextMenuCommand.Data>) {
        super(data);
    }

    public setCommand(data: ContextMenuCommandBuilder.Data|JSONEncodable<ContextMenuCommandBuilder.Data>|((builder: ContextMenuCommandBuilder) => ContextMenuCommandBuilder.Data|JSONEncodable<ContextMenuCommandBuilder.Data>)): this {
        let resolved = typeof data === 'function' ? data(new ContextMenuCommandBuilder()) : data;
            resolved = isJSONEncodable(resolved) ? resolved.toJSON() : resolved;

        this.data = resolved;
        return this;
    }

    public toJSON(): ContextMenuCommand.Data {
        return super.toJSON();
    }
}

export namespace ContextMenuCommand {
    export type Resolvable = ContextMenuCommand|ContextMenuCommand.Data;

    export interface Data extends BaseCommand.Data<CommandType.ContextMenu> {}

    export interface ExecuteData extends BaseCommand.ExecuteData<CommandType.ContextMenu> {
        type: CommandType.ContextMenu;
        command: ContextMenuCommand;
        interaction: UserContextMenuCommandInteraction|MessageContextMenuCommandInteraction;
    }

    export interface ExecuteOptions extends BaseCommand.ExecuteOptions {
        command?: ContextMenuCommand;
        interaction: UserContextMenuCommandInteraction|MessageContextMenuCommandInteraction;
        acceptRepliedInteraction?: boolean;
    }

    export async function execute({ interaction, client, command, acceptRepliedInteraction, throwOnExecuteError }: ExecuteOptions): Promise<ExecuteData|null> {
        if (!interaction.isContextMenuCommand()) return null;
        if ((interaction.replied || interaction.deferred) && !acceptRepliedInteraction) return null;

        command ??= client.commands.get(CommandType.ContextMenu, interaction.commandName) as ContextMenuCommand|undefined;
        if (!command) return null;

        const data: ExecuteData = {
            type: CommandType.ContextMenu,
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
