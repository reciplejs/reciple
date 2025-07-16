import EventEmitter from 'node:events';
import { BaseModule } from '../BaseModule.js';
import { ModuleType } from '../../../helpers/constants.js';
import type { Constructable } from 'discord.js';
import { hasMixin } from 'ts-mixer';

const base: Constructable<Omit<BaseModule, 'moduleType'>> = BaseModule;

export abstract class EventModule<Events extends EventModule.EventMap = EventModule.EventMap, Event extends keyof Events = keyof Events> extends base implements EventModule.Data<Events, Event> {
    public readonly moduleType: ModuleType.Event = ModuleType.Event;
    public abstract emitter: EventEmitter;
    public abstract event: Event;
    public abstract once?: boolean;

    public abstract onEvent(...args: Events[Event]): Promise<void>;

    public static from(data: EventModule.Resolvable): EventModule {
        if (data instanceof EventModule || hasMixin(data, EventModule)) return data;

        const ModuleInstance = class extends EventModule {
            emitter = data.emitter;
            event = data.event;
            once = data.once;
            onEvent = data.onEvent;
        };

        Object.assign(ModuleInstance.prototype, data);
        return new ModuleInstance();
    }
}

export namespace EventModule {
    export type EventMap = Record<string|symbol, any>;
    export type Resolvable<Events extends EventModule.EventMap = EventModule.EventMap, Event extends keyof Events = keyof Events> = EventModule<Events, Event>|EventModule.Data<Events, Event>;

    export interface Data<Events extends EventModule.EventMap = EventModule.EventMap, Event extends keyof Events = keyof Events> extends Omit<BaseModule.Data, 'moduleType'> {
        moduleType: ModuleType.Event;
        emitter: EventEmitter;
        event: Event;
        once?: boolean;
        onEvent: (...args: Events[Event]) => Promise<void>;
    }
}
