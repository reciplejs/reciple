import { ContextMenuCommandBuilder as DiscordJsContextMenuCommandBuilder, type MessageApplicationCommandData, type UserApplicationCommandData } from 'discord.js';
import type { Command } from '../structures/Command.js';

export class ContextMenuCommandBuilder extends DiscordJsContextMenuCommandBuilder {}

export namespace ContextMenuCommandBuilder {
    export type Data = UserApplicationCommandData|MessageApplicationCommandData;

    export interface ExecuteData extends Command.BaseExecuteData<Command.Type.ContextMenu> {
        command: Command<Command.Type.ContextMenu>;
    }
}
