import { SlashCommandBuilder as DiscordJsSlashCommandBuilder, type ChatInputApplicationCommandData, type ChatInputCommandInteraction } from 'discord.js';
import type { Command } from '../structures/Command.js';

export class SlashCommandBuilder extends DiscordJsSlashCommandBuilder {}

export namespace SlashCommandBuilder {
    export type Data = ChatInputApplicationCommandData

    export interface ExecuteData extends Command.BaseExecuteData<Command.Type.Slash> {
        interaction: ChatInputCommandInteraction;
    }

    export interface ExecuteOptions extends Command.BaseExecuteOptions<Command.Type.Slash> {
        interaction: ChatInputCommandInteraction;
    }
}
