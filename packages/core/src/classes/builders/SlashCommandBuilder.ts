import { SlashCommandBuilder as DiscordJsSlashCommandBuilder, type ChatInputApplicationCommandData } from 'discord.js';

export class SlashCommandBuilder extends DiscordJsSlashCommandBuilder {}

export namespace SlashCommandBuilder {
    export type Data = ChatInputApplicationCommandData;
}
