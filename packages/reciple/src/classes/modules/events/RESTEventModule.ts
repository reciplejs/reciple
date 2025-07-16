import { EventModule } from './EventModule.js';
import type { REST, RestEventsMap } from 'discord.js';

export abstract class RESTEventModule<Event extends keyof RestEventsMap> extends EventModule<RestEventsMap, Event> {
    public emitter: REST = this.client.rest;
    public abstract event: Event;
}
