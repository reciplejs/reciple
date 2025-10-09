import { SlashCommand, SlashCommandBuilder, SlashCommandModule } from "reciple";
import { InteractionContextType } from 'discord.js';
import { Modal, TextDisplay } from '@reciple/jsx';

export class SlashPingCommand extends SlashCommandModule {
    data = new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pong!')
        .setContexts([InteractionContextType.BotDM])
        .toJSON();

    async execute(data: SlashCommand.ExecuteData) {
        await data.interaction.showModal(
            <Modal customId='ping-modal' title='Pong!'>
                <TextDisplay>This is a pong message</TextDisplay>
            </Modal>
        );
    }
}

export default new SlashPingCommand();
