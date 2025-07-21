import { ContextMenuCommand, ContextMenuCommandBuilder, ContextMenuCommandModule } from "reciple";
import { ApplicationCommandType, ButtonStyle, InteractionContextType, type BaseMessageOptions } from 'discord.js';
import { ActionRow, Button } from '@reciple/jsx/v1';
import { Embed, EmbedDescription, EmbedImage, EmbedTitle } from '@reciple/jsx/embed';

export class ViewAvatarCommand extends ContextMenuCommandModule {
    data = new ContextMenuCommandBuilder()
        .setName('View Avatar')
        .setType(ApplicationCommandType.User)
        .setContexts([InteractionContextType.Guild])
        .toJSON();

    async execute(data: ContextMenuCommand.ExecuteData) {
        if (!data.interaction.isUserContextMenuCommand()) return;

        const url = data.interaction.targetUser.avatarURL() ?? data.interaction.targetUser.defaultAvatarURL;
        const messageData: BaseMessageOptions = {
            content: url,
            embeds: [
                <Embed color="Blue" timestamp={null}>
                    <EmbedTitle>{data.interaction.targetUser.username}</EmbedTitle>
                    <EmbedDescription>User avatar for {data.interaction.targetUser.toString()}</EmbedDescription>
                    <EmbedImage url={url}/>
                </Embed>
            ],
            components: [
                <ActionRow>
                    <Button url={url} style={ButtonStyle.Link}>Download</Button>
                </ActionRow>
            ]
        };

        console.log(messageData);
        await data.interaction.reply(messageData);
    }
}

export default new ViewAvatarCommand();
