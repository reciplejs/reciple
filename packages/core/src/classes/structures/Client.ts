import { Client as DiscordJsClient, type Awaitable, type ClientEvents, type ClientOptions, type If } from 'discord.js';
import { ModuleManager } from '../managers/ModuleManager.js';
import { Module } from './Module.js';
import { CommandManager } from '../managers/CommandManager.js';

export interface Client<Ready extends boolean = boolean> extends DiscordJsClient<Ready> {
    on<E extends keyof Client.Events>(event: E, listener: (...args: Client.Events[E]) => Awaitable<void>): this;
    on<E extends string|symbol>(event: E, listener: (...args: any) => Awaitable<void>): this;

    once<E extends keyof Client.Events>(event: E, listener: (...args: Client.Events[E]) => Awaitable<void>): this;
    once<E extends string | symbol>(event: E, listener: (...args: any) => Awaitable<void>): this;

    emit<E extends keyof Client.Events>(event: E, ...args: Client.Events[E]): boolean;

    off<E extends keyof Client.Events>(event: E, listener: (...args: Client.Events[E]) => Awaitable<void>): this;
    off<E extends string | symbol>(event: E, listener: (...args: any) => Awaitable<void>): this;

    removeAllListeners<E extends keyof Client.Events>(event?: E): this;
    removeAllListeners(event?: string | symbol): this;

    removeListener<E extends keyof Client.Events>(event: E, listener: Function): this;
    removeListener(event: string | symbol, listener: Function): this;

    isReady(): this is Client<true>;
}

export class Client<Ready extends boolean = boolean> extends DiscordJsClient<Ready> {
    private _modules: ModuleManager = new ModuleManager(this);
    private _commands: CommandManager|null = null;

    get modules() {
        return this._modules;
    }

    get commands() {
        return this._commands as If<Ready, CommandManager, null>;
    }

    public constructor(options: Client.Options) {
        super(options);

        if (options.modules) for (const module of options.modules) {
            this.modules.cache.set(module.id, Module.from(module));
        }
    }

    public async login(token: string): Promise<string> {
        this._commands = new CommandManager(this);

        await this.modules.enableModules();

        this.once('ready', async () => {
            await this.modules.readyModules();
        });

        return super.login(token);
    }

    public async destroy(clearModuleCache: boolean = false): Promise<void> {
        this._commands = null;

        await this.modules.disableModules({ removeFromCache: clearModuleCache });

        return super.destroy();
    }
}

export namespace Client {
    export interface Options extends ClientOptions {
        modules?: Module.Resolvable[];
    }

    export interface Events extends ClientEvents {}
}
