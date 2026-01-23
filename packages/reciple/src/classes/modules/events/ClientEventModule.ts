import type { Client } from '@reciple/core';
import { EventModule } from './EventModule.js';

export abstract class ClientEventModule<Event extends keyof Client.Events> extends EventModule<Client.Events, Event> {
    public emitter: Client = useClient();
    public abstract event: Event;
}
