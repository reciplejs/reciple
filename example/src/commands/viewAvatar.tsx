import { ContextMenuCommand, ContextMenuCommandBuilder, ContextMenuCommandModule } from "reciple";
import { ApplicationCommandType, ButtonStyle, InteractionContextType } from 'discord.js';
import { ActionRow, Button, StringSelectMenu } from '@reciple/jsx/v1';

export class ViewAvatarCommand extends ContextMenuCommandModule {
    data = new ContextMenuCommandBuilder()
        .setName('View Avatar')
        .setType(ApplicationCommandType.User)
        .setContexts([InteractionContextType.Guild])
        .toJSON();

    async execute(data: ContextMenuCommand.ExecuteData) {
        if (!data.interaction.isUserContextMenuCommand()) return;

        const url = data.interaction.targetUser.avatarURL() ?? data.interaction.targetUser.defaultAvatarURL;

        await data.interaction.reply({
            content: url,
            components: [
                <ActionRow>
                    <Button url={url} style={ButtonStyle.Link}>View Avatar</Button>
                    <StringSelectMenu customId='eee'/>
                </ActionRow>
            ]
        });
    }
}

export default new ViewAvatarCommand();
