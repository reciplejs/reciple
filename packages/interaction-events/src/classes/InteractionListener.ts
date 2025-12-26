import { isJSONEncodable, type JSONEncodable } from 'discord.js';
import type { InteractionListenerType } from '../helpers/constants.js';
import type { InteractionListenerData, InteractionFromListenerType } from '../helpers/types.js';
import { DiscordSnowflake } from '@sapphire/snowflake';

export class InteractionListener<T extends InteractionListenerType> implements InteractionListenerData<T> {
    public readonly id: string = DiscordSnowflake.generate().toString();
    public readonly moduleId?: string;
    public readonly type!: T;
    public readonly cooldown?: number;
    public readonly once?: boolean;

    constructor(data: InteractionListener.Resolvable<T>) {
        Object.assign(this, isJSONEncodable(data) ? data.toJSON() : data);
    }

    public filter(interaction: InteractionFromListenerType<T>): boolean {
        return true;
    }

    public execute(interaction: InteractionFromListenerType<T>): Promise<void> {
        return Promise.resolve();
    }

    public toJSON(): InteractionListenerData<T> {
        return {
            type: this.type,
            cooldown: this.cooldown,
            once: this.once,
            filter: this.filter,
            execute: this.execute
        };
    }

    public static from<T extends InteractionListenerType>(data: InteractionListener.Resolvable<T>): InteractionListener<T> {
        if (data instanceof InteractionListener) return data;

        return new InteractionListener(data);
    }
}

export namespace InteractionListener {
    export type Resolvable<T extends InteractionListenerType> = InteractionListener<T>|InteractionListenerData<T>|JSONEncodable<InteractionListenerData<T>>;
}
