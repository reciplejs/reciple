import { InteractionContextType } from 'discord.js';
import { CommandType } from '../../helpers/constants.js';
import { CommandPrecondition } from '../structures/CommandPrecondition.js';
import type { AnyCommandExecuteData } from '../../helpers/types.js';

export class MessageCommandPermissionPrecondition extends CommandPrecondition {
    public scope: CommandType[] = [CommandType.Message];

    constructor() {
        super();
    }

    public async execute<T extends CommandType>(data: AnyCommandExecuteData<T>): Promise<CommandPrecondition.ResultDataResolvable<T, any>> {
        if (data.type !== CommandType.Message) return true;

        const message = data.message;
        const guild = message.inGuild() ? message.guild : null;
        const channel = message.channel;
        const user = message.author;

        const requiredMemberPermissions = data.command.data.requiredMemberPermissions;
        const contexts = data.command.data.contexts;

        if (channel.isDMBased() && user.dmChannel?.id === channel.id && !contexts?.includes(InteractionContextType.BotDM)) {
            return false;
        }

        if (channel.isDMBased() && !contexts?.includes(InteractionContextType.PrivateChannel)) {
            return false;
        }

        if (!channel.isDMBased() && !contexts?.includes(InteractionContextType.Guild)) {
            return false;
        }

        const member = guild ? (message.member ?? await guild.members.fetch(message.author.id)) : null;

        if (requiredMemberPermissions && guild && member) {
            if (!member.permissionsIn(channel.id).has(requiredMemberPermissions)) {
                return false;
            }
        }

        return true;
    }
}

export namespace MessageCommandPermissionPrecondition {}
