import { SlashCommand, SlashCommandBuilder, SlashCommandModule } from "reciple";
import { InteractionContextType } from 'discord.js';

export class SlashPingCommand extends SlashCommandModule {
    data = new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pong!')
        .setContexts([InteractionContextType.Guild])
        .toJSON();

    async execute(data: SlashCommand.ExecuteData) {
        await data.interaction.reply('Pong!');
    }
}

export default new SlashPingCommand();
