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

        await message.reply({
            content: await this.getResponse(data)
        });

        return false;
    }

    public async getResponse(data: CommandPostcondition.ExecuteData<CommandType>): Promise<string> {
        if (data.executeData.type !== CommandType.Message) throw new Error('Invalid command type');

        const invalidOptions = await data.executeData.options.getInvalidOptions();
        const invalidFlags = await data.executeData.flags.getInvalidFlags();

        switch (data.reason) {
            case CommandPostconditionReason.InvalidArgs:
                return `Invalid arguments ${invalidOptions.filter(o => o.missing === false).map(o => inlineCode(o.option.name)).join(' ')} were passed to the command`;
            case CommandPostconditionReason.MissingArgs:
                return `Missing arguments ${invalidOptions.filter(o => o.missing === true).map(o => inlineCode(o.option.name)).join(' ')} were passed to the command`;
            case CommandPostconditionReason.InvalidFlags:
                return `Invalid flags ${invalidFlags.filter(o => o.missing === false).map(o => inlineCode(o.flag.name)).join(' ')} were passed to the command`;
            case CommandPostconditionReason.MissingFlags:
                return `Missing flags ${invalidFlags.filter(o => o.missing === true).map(o => inlineCode(`--${o.flag.name}`)).join(' ')} were passed to the command`;
        }

        return 'No error';
    }
}

export default new MessageCommandPostcondition();
