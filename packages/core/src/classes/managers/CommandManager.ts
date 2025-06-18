import type { Client } from '../structures/Client.js';
import { Command } from '../structures/Command.js';
import { BaseManager } from './BaseManager.js';

export class CommandManager extends BaseManager<string, Command<Command.Type>, Command.Resolvable<Command.Type>> {
    public constructor(client: Client) {
        super(client, Command);
    }

    public create<T extends Command.Type>(command: Command.Resolvable<T>): Command<T> {
        const resolved = command instanceof Command ? command : new Command(command);

        if (this.cache.has(resolved.id)) {
            // TODO: Use custom error
            throw new Error('A command with the same ID already exists.');
        }

        this.cache.set(resolved.id, resolved);
        return resolved;
    }
}
