import type { Client } from '../structures/Client.js';
import { Command } from '../structures/Command.js';
import { BaseManager } from './BaseManager.js';

export class CommandManager extends BaseManager<string, Command, Command.Resolvable> {
    public constructor(client: Client) {
        super(client, Command);
    }
}
