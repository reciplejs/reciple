import { InteractionListenerType } from '../../helpers/constants.js';
import type { InteractionListenerData } from '../../helpers/types.js';

export class InteractionListenerBuilder<T extends InteractionListenerType> {
    public readonly data: Partial<InteractionListenerData<T>> = {};

    public constructor(data?: Partial<InteractionListenerData<T>>) {
        if (data) this.data = data;
    }

    public setType<Type extends T>(type: Type): InteractionListenerBuilder<Type> {
        this.data.type = type;
        return this as any;
    }

    public setOnce(once: boolean): this {
        this.data.once = once;
        return this;
    }

    public setCooldown(cooldown: number): this {
        this.data.cooldown = cooldown;
        return this;
    }

    public setFilter(filter: InteractionListenerData<T>['filter']): this {
        this.data.filter = filter;
        return this;
    }

    public setExecute(execute: InteractionListenerData<T>['execute']): this {
        this.data.execute = execute;
        return this;
    }

    public toJSON(): InteractionListenerData<T> {
        return this.data as InteractionListenerData<T>;
    }
}
