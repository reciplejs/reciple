import { ContextMenuCommandBuilder as DiscordJsContextMenuCommandBuilder, type RESTPostAPIContextMenuApplicationCommandsJSONBody } from 'discord.js';

export class ContextMenuCommandBuilder extends DiscordJsContextMenuCommandBuilder {}

export namespace ContextMenuCommandBuilder {
    export type Data = RESTPostAPIContextMenuApplicationCommandsJSONBody;
}
