import { Client as DiscordJsClient, type Awaitable, type ClientEvents, type ClientOptions, type If } from 'discord.js';
import { ModuleManager } from '../managers/ModuleManager.js';
import { Module } from './Module.js';
import type { BaseCooldownAdapter } from '../abstract/BaseCooldownAdapter.js';
import { CooldownManager } from '../managers/CooldownManager.js';
import { PreconditionManager } from '../managers/PreconditionManager.js';
import { CooldownAdapter } from '../adapters/CooldownAdapter.js';
import { CommandManager } from '../managers/CommandManager.js';
import { BasePrecondition } from '../abstract/BasePrecondition.js';
import type { AnyCommandResolvable } from '../../helpers/types.js';
import { BaseCommand } from '../abstract/BaseCommand.js';

declare module "discord.js" {
    interface ClientOptions {
        modules?: Module.Resolvable[];
        preconditions?: BasePrecondition.Resolvable[];
        commands?: AnyCommandResolvable[];
        cooldownAdapter?: BaseCooldownAdapter.Constructor;
    }
}

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
    private _cooldowns: CooldownManager<BaseCooldownAdapter>|null = null;
    private _preconditions: PreconditionManager|null = null;

    get modules() {
        return this._modules;
    }

    get commands() {
        return this._commands as If<Ready, CommandManager, null>;
    }

    get cooldowns() {
        return this._cooldowns as If<Ready, CooldownManager<BaseCooldownAdapter>, null>;
    }

    get preconditions() {
        return this._preconditions as If<Ready, PreconditionManager, null>;
    }

    public constructor(options: ClientOptions) {
        super(options);

        if (options.modules) for (const module of options.modules) {
            this.modules.cache.set(module.id, Module.from(module));
        }
    }

    public async login(token: string): Promise<string> {
        this._commands = new CommandManager(this);
        this._cooldowns = new CooldownManager(this, this.options.cooldownAdapter ? new this.options.cooldownAdapter(this) : new CooldownAdapter(this));
        this._preconditions = new PreconditionManager(this);

        await this.modules.enableModules();

        if (this.options.preconditions) {
            for (const precondition of this.options.preconditions) {
                this._preconditions.cache.set(precondition.id, precondition instanceof BasePrecondition ? precondition : BasePrecondition.from(precondition));
            }
        }

        if (this.options.commands) {
            for (const command of this.options.commands) {
                this._commands.cache.set(command.id, command instanceof BaseCommand ? command : BaseCommand.createInstance(command));
            }
        }

        this.setMaxListeners(this.getMaxListeners() + 1);

        this.once('ready', async () => {
            this.setMaxListeners(this.getMaxListeners() - 1);
            await this.modules.readyModules();
        });

        return super.login(token);
    }

    public async destroy(clearModuleCache: boolean = false): Promise<void> {
        await this.modules.disableModules({ removeFromCache: clearModuleCache });

        this._commands = null;
        this._cooldowns = null;
        this._preconditions = null;

        return super.destroy();
    }
}

export namespace Client {
    export interface Events extends ClientEvents {}
}
