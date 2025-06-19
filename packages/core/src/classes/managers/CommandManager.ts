import { type Constructable } from 'discord.js';
import type { AnyCommand, AnyCommandResolvable } from '../../helpers/types.js';
import { BaseCommand } from '../abstract/BaseCommand.js';
import { BaseManager } from '../abstract/BaseManager.js';
import type { Client } from '../structures/Client.js';
import { CommandType } from '../../helpers/constants.js';

export class CommandManager extends BaseManager<string, AnyCommand, AnyCommandResolvable> {
    public constructor(public readonly client: Client) {
        super(client, BaseCommand as Constructable<AnyCommand>);
    }

    get applicationCommands() {
        return this.cache
            .filter(c => c.type === CommandType.Slash || c.type === CommandType.ContextMenu)
            .map(c => c.data);
    }

    public add<T extends CommandType>(data: AnyCommandResolvable<T>): this {
        const command = data instanceof this.holds ? data : BaseCommand.createInstance(data.type, data) as AnyCommand<T>;

        if (this.cache.get(command.id)) {
            // TODO: Use custom error
            throw new Error('Command already exists');
        }

        this.cache.set(command.id, command);
        return this;
    }

    public remove(resolvable: AnyCommandResolvable|string): this {
        const id = typeof resolvable === 'string' ? resolvable : resolvable.id;
        const command = this.cache.get(id);

        if (!command) return this;

        this.cache.delete(id);

        return this;
    }
}
