// @ts-check
import { SlashCommand, SlashCommandBuilder, SlashCommandModule } from "reciple";
import { InteractionContextType } from 'discord.js';

export class SlashPingCommand extends SlashCommandModule {
    data = new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pong!')
        .setContexts([InteractionContextType.Guild])
        .toJSON();

    /**
     * 
     * @param {SlashCommand.ExecuteData} data 
     */
    async execute(data) {
        await data.interaction.reply('Pong!');
    }
}

export default new SlashPingCommand();
