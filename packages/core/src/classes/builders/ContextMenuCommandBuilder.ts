import { ContextMenuCommandBuilder as DiscordJsContextMenuCommandBuilder, type MessageApplicationCommandData, type UserApplicationCommandData, type UserContextMenuCommandInteraction } from 'discord.js';
import type { Command } from '../structures/Command.js';

export class ContextMenuCommandBuilder extends DiscordJsContextMenuCommandBuilder {}

export namespace ContextMenuCommandBuilder {
    export type Data = UserApplicationCommandData|MessageApplicationCommandData;

    export interface ExecuteData extends Command.BaseExecuteData<Command.Type.ContextMenu> {
        interaction: UserContextMenuCommandInteraction|MessageApplicationCommandData;
    }

    export interface ExecuteOptions extends Command.BaseExecuteOptions<Command.Type.ContextMenu> {
        interaction: UserContextMenuCommandInteraction|MessageApplicationCommandData;
    }
}
