import { CommandPostconditionReason, CommandType, CooldownTriggerType } from '../../helpers/constants.js';
import type { AnyCommandExecuteData } from '../../helpers/types.js';
import type { BaseCommandPostcondition } from '../abstract/BaseCommandPostcondition.js';
import { BaseCommandPrecondition } from '../abstract/BaseCommandPrecondition.js';

export class CooldownCommandPrecondition extends BaseCommandPrecondition<BaseCommandPostcondition.CooldownExecuteData<CommandType>> {
    public scope: CommandType[] = [];

    public async execute<T extends CommandType>(data: AnyCommandExecuteData<T>): Promise<BaseCommandPrecondition.ResultDataResolvable<T, BaseCommandPostcondition.CooldownExecuteData<CommandType>>> {
        const userId = data.type === CommandType.Message ? data.message.author.id : data.interaction.user.id;
        const guildId = data.type === CommandType.Message ? data.message.guildId : data.interaction.guildId;
        const channelId = data.type === CommandType.Message ? data.message.channelId : data.interaction.channelId;

        let cooldown = await data.client.cooldowns.fetchForUser(userId, {
            guildId: guildId ?? undefined,
            channelId: channelId ?? undefined,
            trigger: {
                type: CooldownTriggerType.Command,
                commands: [data.command]
            }
        }).then(data => data.at(0));

        if (cooldown?.isExpired) {
            await data.client.cooldowns.adapter.delete({
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
