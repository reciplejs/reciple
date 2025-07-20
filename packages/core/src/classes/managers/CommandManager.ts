import { ApplicationCommandType, Collection, type ApplicationCommand, type ApplicationCommandDataResolvable, type Constructable } from 'discord.js';
import type { AnyCommand, AnyCommandExecuteData, AnyCommandResolvable } from '../../helpers/types.js';
import { BaseCommand } from '../abstract/BaseCommand.js';
import { BaseManager } from '../abstract/BaseManager.js';
import type { Client } from '../structures/Client.js';
import { CommandType } from '../../helpers/constants.js';
import { EventEmitter } from 'node:events';
import { mix } from 'ts-mixer';
import { RecipleError } from '../structures/RecipleError.js';
import { Utils } from '../structures/Utils.js';
import type { SlashCommandBuilder } from '../builders/SlashCommandBuilder.js';
import type { ContextMenuCommandBuilder } from '../builders/ContextMenuCommandBuilder.js';

export interface CommandManager extends BaseManager<string, AnyCommand, AnyCommandResolvable>, EventEmitter<CommandManager.Events> {}

@mix(BaseManager, EventEmitter)
export class CommandManager {
    public readonly holds = BaseCommand as Constructable<AnyCommand>;

    constructor(public readonly client: Client) {}

    get applicationCommands() {
        return this.cache
            .filter(c => c.type === CommandType.Slash || c.type === CommandType.ContextMenu)
            .map(c => c.data);
    }

    public add<T extends CommandType>(data: AnyCommandResolvable<T>): this {
        const command = data instanceof this.holds ? data : Utils.createCommandInstance(data) as AnyCommand<T>;

        if (this.cache.get(command.id)) throw new RecipleError(RecipleError.Code.CommandAlreadyExists(command));

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

    public async registerApplicationCommands(options?: CommandManager.RegisterApplicationCommandsOptions): Promise<CommandManager.RegisteredCommandsData> {
        const globalCommands = new Collection<string, ApplicationCommandDataResolvable>();
        const guildCommands = new Collection<string, Collection<string, ApplicationCommandDataResolvable>>();

        if (!this.client.isReady()) throw new RecipleError(RecipleError.Code.ClientNotReady());

        const slashCommands = (options?.commands ?? this.applicationCommands).filter(c => c.type === ApplicationCommandType.ChatInput);
        const contextMenuCommands = (options?.commands ?? this.applicationCommands).filter(c => c.type === ApplicationCommandType.Message || c.type === ApplicationCommandType.User);

        if (options?.registerGlobally) {
            if (options.slashCommands?.registerGlobally) slashCommands?.forEach(c => globalCommands.set(c.name, c));
            if (options.contextMenuCommands?.registerGlobally) contextMenuCommands?.forEach(c => globalCommands.set(c.name, c));
        }

        if (options?.registerToGuilds) {
            const guilds = Array.isArray(options.registerToGuilds) ? options.registerToGuilds : [];
            const slashCommandGuilds = options.slashCommands?.registerToGuilds
                ? Array.isArray(options.slashCommands.registerToGuilds)
                    ? options.slashCommands.registerToGuilds
                    : []
                : [];
            const contextMenuCommandGuilds = options.contextMenuCommands?.registerToGuilds
                ? Array.isArray(options.contextMenuCommands.registerToGuilds)
                    ? options.contextMenuCommands.registerToGuilds
                    : []
                : [];

            for (const guildId of guilds) {
                const commands = guildCommands.get(guildId) ?? new Collection<string, ApplicationCommandDataResolvable>();

                slashCommands.forEach(c => commands.set(c.name, c));
                contextMenuCommands.forEach(c => commands.set(c.name, c));
                guildCommands.set(guildId, commands);
            }

            for (const guildId of slashCommandGuilds) {
                const commands = guildCommands.get(guildId) ?? new Collection<string, ApplicationCommandDataResolvable>();

                slashCommands.forEach(c => commands.set(c.name, c));
                guildCommands.set(guildId, commands);
            }

            for (const guildId of contextMenuCommandGuilds) {
                const commands = guildCommands.get(guildId) ?? new Collection<string, ApplicationCommandDataResolvable>();

                contextMenuCommands.forEach(c => commands.set(c.name, c));
                guildCommands.set(guildId, commands);
            }
        }

        const registeredCommands: CommandManager.RegisteredCommandsData = { global: new Collection(), guilds: new Collection() };

        if (options?.registerGlobally && (options.allowEmptyCommands !== false || globalCommands.size > 0)) {
            registeredCommands.global = await this.client.application?.commands
                .set(Array.from(globalCommands.values()))
                .catch(error => {
                    this.emitOrThrow(error);
                    return new Collection();
                });

            this.emit('applicationCommandsRegister', registeredCommands.global, undefined);
        }

        if (options?.registerToGuilds) {
            for (const [guildId, commands] of guildCommands) {
                if (options.allowEmptyCommands === false && !commands.size) continue;

                const registered: Collection<string, ApplicationCommand>|null = await this.client.application?.commands
                    .set(Array.from(commands.values()), guildId)
                    .catch(error => {
                        this.emitOrThrow(error);
                        return null;
                    });

                if (!registered) continue;
                registeredCommands.guilds.set(guildId, registered);
                this.emit('applicationCommandsRegister', registered, guildId);
            }
        }

        return registeredCommands;
    }

    private emitOrThrow(error: unknown): boolean {
        if (this.client.listenerCount('error') > 0) return this.emit('error', error);
        throw error;
    }
}

export namespace CommandManager {
    export interface Events {
        error: [error: unknown];
        commandCreate: [command: AnyCommand];
        commandRemove: [command: AnyCommand];
        commandExecute: [data: AnyCommandExecuteData];
        applicationCommandsRegister: [commands: Collection<string, ApplicationCommand>, guildId: string|undefined];
    }

    export interface RegisterApplicationCommandsOptions {
        commands?: (SlashCommandBuilder.Data|ContextMenuCommandBuilder.Data)[];
        slashCommands?: {
            registerToGuilds?: boolean|string[];
            registerGlobally?: boolean;
        };
        contextMenuCommands?: {
            registerToGuilds?: boolean|string[];
            registerGlobally?: boolean;
        };
        allowEmptyCommands?: boolean;
        registerToGuilds?: boolean|string[];
        registerGlobally?: boolean;
    }

    export interface RegisteredCommandsData {
        global: Collection<string, ApplicationCommand>;
        guilds: Collection<string, Collection<string, ApplicationCommand>>;
    }
}
