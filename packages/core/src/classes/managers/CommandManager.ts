import { type Constructable } from 'discord.js';
import type { AnyCommand, AnyCommandExecuteData, AnyCommandResolvable } from '../../helpers/types.js';
import { BaseCommand } from '../abstract/BaseCommand.js';
import { BaseManager } from '../abstract/BaseManager.js';
import type { Client } from '../structures/Client.js';
import { CommandType } from '../../helpers/constants.js';
import EventEmitter from 'node:events';
import { mix } from 'ts-mixer';

export interface CommandManager extends BaseManager<string, AnyCommand, AnyCommandResolvable>, EventEmitter<CommandManager.Events> {}

@mix(BaseManager, EventEmitter)
export class CommandManager {
    public readonly holds = BaseCommand as Constructable<AnyCommand>;

    public constructor(public readonly client: Client) {}

    get applicationCommands() {
        return this.cache
            .filter(c => c.type === CommandType.Slash || c.type === CommandType.ContextMenu)
            .map(c => c.data);
    }

    public add<T extends CommandType>(data: AnyCommandResolvable<T>): this {
        const command = data instanceof this.holds ? data : BaseCommand.createInstance(data) as AnyCommand<T>;

        if (this.cache.get(command.id)) {
            // TODO: Use custom error
            throw new Error('Command already exists');
        }

        this.cache.set(command.id, command);
        this.emit('commandCreate', command);

        return this;
    }

    public remove(resolvable: AnyCommandResolvable|string): this {
        const id = typeof resolvable === 'string' ? resolvable : resolvable.id;
        const command = this.cache.get(id);

        if (!command) return this;

        this.cache.delete(id);
        this.emit('commandRemove', command);

        return this;
    }

    public get<T extends CommandType>(type: T, name: string): AnyCommand<T>|undefined {
        return this.cache.find(c => c.type === type && c.data.name === name) as AnyCommand<T>|undefined;
    }
}

export namespace CommandManager {
    export interface Events {
        commandCreate: [command: AnyCommand];
        commandRemove: [command: AnyCommand];
        commandExecute: [data: AnyCommandExecuteData];
    }
}
