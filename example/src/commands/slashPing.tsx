import { SlashCommand, SlashCommandBuilder, SlashCommandModule } from "reciple";
import { ButtonStyle, inlineCode, InteractionContextType } from 'discord.js';
import { ActionRow, Button, Embed, EmbedAuthor, EmbedDescription } from '@reciple/jsx';
import { InteractionListenerBuilder, InteractionListenerType } from '@reciple/modules';

export class SlashPingCommand extends SlashCommandModule {
    data = new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pong!')
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
        .toJSON();

    interactions = [
        new InteractionListenerBuilder()
            .setType(InteractionListenerType.Button)
            .setFilter(interaction => interaction.customId === 'refresh-ping')
            .setExecute(async interaction => {
                await interaction.deferUpdate();
                await interaction.message.edit(this.createPingMessage(false));
            })
    ];

    async execute(data: SlashCommand.ExecuteData) {
        await data.interaction.reply(this.createPingMessage(false));
    }

    createPingMessage(disabled: boolean) {
        return {
            embeds: [
                <Embed color="Blue" timestamp={null}>
                    <EmbedAuthor name="🏓 Pong"/>
                    <EmbedDescription>
                        {inlineCode(`${this.client.ws.ping}ms`)}
                    </EmbedDescription>
                </Embed>
            ],
            components: [
                <ActionRow>
                    <Button style={ButtonStyle.Primary} customId='refresh-ping' disabled={disabled}>
                        Refresh
                    </Button>
                </ActionRow>
            ]
        }
    }
}

export default new SlashPingCommand();
