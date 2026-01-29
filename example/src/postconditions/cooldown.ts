import { CommandPostconditionReason, CommandType, PostconditionModule, type CommandPostcondition } from 'reciple';
import { time } from 'discord.js';

export class CooldownHandler extends PostconditionModule {
    public accepts: CommandPostconditionReason[] = [CommandPostconditionReason.Cooldown];

    public async execute<T extends CommandType>(data: CommandPostcondition.ExecuteData<T>): Promise<CommandPostcondition.ResultDataResolvable<T, any>> {
        if (data.reason !== CommandPostconditionReason.Cooldown) return false;

        switch (data.executeData.type) {
            case CommandType.Message:
                const message = data.executeData.message;

                await message.reply(`You cannot use this command for ${time(data.cooldown.endsAt, 'R')}`);
                return true;
            case CommandType.Slash:
            case CommandType.ContextMenu:
                const interaction = data.executeData.interaction;

                await interaction.reply(`You cannot use this command for ${time(data.cooldown.endsAt, 'R')}`);
                return true;
        }
    }
}

export default new CooldownHandler();
