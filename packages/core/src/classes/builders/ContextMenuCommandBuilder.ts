import { ContextMenuCommandBuilder as DiscordJsContextMenuCommandBuilder, type MessageApplicationCommandData, type UserApplicationCommandData } from 'discord.js';

export class ContextMenuCommandBuilder extends DiscordJsContextMenuCommandBuilder {}

export namespace ContextMenuCommandBuilder {
    export type Data = UserApplicationCommandData|MessageApplicationCommandData;
}
