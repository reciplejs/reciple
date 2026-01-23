import { SlashCommandBuilder as DiscordJsSlashCommandBuilder, type RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';

export class SlashCommandBuilder extends DiscordJsSlashCommandBuilder {}

export namespace SlashCommandBuilder {
    export type Data = RESTPostAPIChatInputApplicationCommandsJSONBody;
}
