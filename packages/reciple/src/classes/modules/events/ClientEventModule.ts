import type { Client } from '@reciple/core';
import { EventModule } from './EventModule.js';

export abstract class ClientEventModule<Event extends keyof Client.Events> extends EventModule<Client.Events, Event> {
    public emitter: Client = getClient();
    public abstract event: Event;
}
