import { CommandPostconditionReason, CommandType, PostconditionModule, type CommandPostcondition, type CommandPrecondition } from 'reciple';
import { inlineCode } from 'discord.js';

export class MessageCommandPostcondition extends PostconditionModule {
    public accepts: CommandPostconditionReason[] = [
        CommandPostconditionReason.InvalidArgs,
        CommandPostconditionReason.InvalidFlags,
        CommandPostconditionReason.MissingArgs,
        CommandPostconditionReason.MissingFlags
    ];

    public async execute<T extends CommandType>(data: CommandPostcondition.ExecuteData<T>, preconditionTrigger?: CommandPrecondition.ResultData<T, any> | undefined): Promise<CommandPostcondition.ResultDataResolvable<T, any>> {
        if (data.executeData.type !== CommandType.Message) return true;

        const message = data.executeData.message;
        const invalidOptions = await data.executeData.options.getInvalidOptions();
        const invalidFlags = await data.executeData.flags.getInvalidFlags();

        switch (data.reason) {
            case CommandPostconditionReason.InvalidArgs:
                await message.reply(`Invalid arguments ${invalidOptions.filter(o => o.missing === false).map(o => inlineCode(o.option.name)).join(' ')} were passed to the command`);
                return true;
            case CommandPostconditionReason.MissingArgs:
                await message.reply(`Missing arguments ${invalidOptions.filter(o => o.missing === true).map(o => inlineCode(o.option.name)).join(' ')} were passed to the command`);
                return true;
            case CommandPostconditionReason.InvalidFlags:
                await message.reply(`Invalid flags ${invalidFlags.filter(o => o.missing === false).map(o => inlineCode(o.flag.name)).join(' ')} were passed to the command`);
            case CommandPostconditionReason.MissingFlags:
                await message.reply(`Missing flags ${invalidFlags.filter(o => o.missing === true).map(o => inlineCode(`--${o.flag.name}`)).join(' ')} were passed to the command`);
                return true;
        }

        return false;
    }
}

export default new MessageCommandPostcondition();
