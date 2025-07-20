// @ts-check
import { ContextMenuCommand, ContextMenuCommandBuilder, ContextMenuCommandModule } from "reciple";
import { ApplicationCommandType, InteractionContextType } from 'discord.js';

export class ViewAvatarCommand extends ContextMenuCommandModule {
    data = new ContextMenuCommandBuilder()
        .setName('View Avatar')
        .setType(ApplicationCommandType.User)
        .setContexts([InteractionContextType.Guild])
        .toJSON();

    /**
     * 
     * @param {ContextMenuCommand.ExecuteData} data 
     */
    async execute(data) {
        if (!data.interaction.isUserContextMenuCommand()) return;

        await data.interaction.reply({
            content: data.interaction.targetUser.avatarURL() ?? data.interaction.targetUser.defaultAvatarURL
        });
    }
}

export default new ViewAvatarCommand();
