import { CommandPostconditionReason, CommandType, CooldownTriggerType } from '../../helpers/constants.js';
import type { AnyCommandExecuteData } from '../../helpers/types.js';
import type { CommandPostcondition } from '../structures/CommandPostcondition.js';
import { CommandPrecondition } from '../structures/CommandPrecondition.js';

export class CooldownCommandPrecondition extends CommandPrecondition<CommandPostcondition.CooldownExecuteData<CommandType>> {
    public scope: CommandType[] = [];

    constructor(public readonly options?: CooldownCommandPrecondition.Options) {
        super();

        if (options?.scope) this.scope = options.scope;
    }

    public async execute<T extends CommandType>(data: AnyCommandExecuteData<T>): Promise<CommandPrecondition.ResultDataResolvable<T, CommandPostcondition.CooldownExecuteData<CommandType>>> {
        const userId = data.type === CommandType.Message ? data.message.author.id : data.interaction.user.id;
        const guildId = this.options?.matchWithin === 'guild' ? (data.type === CommandType.Message ? data.message.guildId : data.interaction.guildId) : undefined;
        const channelId = this.options?.matchWithin === 'channel' ? (data.type === CommandType.Message ? data.message.channelId : data.interaction.channelId) : undefined;

        let cooldown = await data.client.cooldowns.fetchForUser(userId, {
            guildId: guildId ?? undefined,
            channelId: channelId ?? undefined,
            trigger: {
                type: CooldownTriggerType.Command,
                commands: [data.command]
            }
        }).then(data => data.at(0));

        if (cooldown?.isExpired) {
            if (this.options?.deleteWhenExpired !== false) await data.client.cooldowns.adapter.delete({
                where: {
                    id: cooldown.id
                }
            });

            cooldown = undefined;
        }

        if (!cooldown) {
            if (data.command.cooldown) await data.client.cooldowns.create({
                userId,
                guildId: guildId ?? undefined,
                channelId: channelId ?? undefined,
                endsAt: new Date(Date.now() + data.command.cooldown),
                trigger: {
                    type: CooldownTriggerType.Command,
                    commands: [data.command]
                }
            });

            return true;
        }

        return {
            postconditionExecute: {
                data: {
                    reason: CommandPostconditionReason.Cooldown,
                    cooldown,
                    executeData: data,
                }
            },
            success: false
        };
    }
}

export namespace CooldownCommandPrecondition {
    export interface Options {
        scope?: CommandType[];
        matchWithin?: 'global'|'guild'|'channel';
        deleteWhenExpired?: boolean;
    }
}
