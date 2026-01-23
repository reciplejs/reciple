import { DiscordSnowflake } from '@sapphire/snowflake';
import type { Client } from './Client.js';
import type { InteractionType, SendableChannels } from 'discord.js';
import type { CommandType, CooldownTriggerType } from '../../helpers/constants.js';

export class Cooldown implements Cooldown.Data {
    public id: string = DiscordSnowflake.generate().toString();
    public userId!: string;
    public guildId?: string;
    public channelId?: string;
    public trigger?: Cooldown.Trigger;
    public endsAt!: Date;

    get remainingMs() {
        const remaining = this.endsAt.getTime() - Date.now();
        return remaining >= 0 ? remaining : 0;
    }

    get isExpired() {
        return this.remainingMs <= 0;
    }

    get user() {
        return this.client.users.cache.get(this.userId);
    }

    get channel() {
        return this.channelId ? this.client.channels.cache.get(this.channelId) as SendableChannels|undefined : undefined;
    }

    get guild() {
        return (this.guildId ? this.client.guilds.cache.get(this.guildId) : undefined) ?? (this.channel && !this.channel.isDMBased() ? this.channel.guild : undefined);
    }

    constructor(public readonly client: Client, data: Omit<Cooldown.Data, 'id'>) {
        Object.assign(this, data);
    }

    public toJSON(): Cooldown.Data {
        return {
            id: this.id,
            userId: this.userId,
            guildId: this.guildId,
            channelId: this.channelId,
            trigger: this.trigger,
            endsAt: this.endsAt
        };
    }
}

export namespace Cooldown {
    export type Resolvable = Cooldown;

    export interface Data {
        id: string;
        userId: string;
        guildId?: string;
        channelId?: string;
        trigger?: Trigger;
        endsAt: Date;
    }

    export type Trigger = CommandTrigger|InteractionTrigger;

    export interface CommandTrigger {
        type: CooldownTriggerType.Command;
        commands: {
            type?: CommandType;
            id?: string;
            name?: string;
        }[];
    }

    export interface InteractionTrigger {
        type: CooldownTriggerType.Interaction;
        interactions?: {
            type?: InteractionType;
            customId?: string;
            commandName?: string;
        }[];
    }
}
