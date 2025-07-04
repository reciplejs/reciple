import { Client as DiscordJsClient, Message, type Awaitable, type ClientEvents, type ClientOptions, type If, type Interaction } from 'discord.js';
import { ModuleManager } from '../managers/ModuleManager.js';
import { Module } from './Module.js';
import type { BaseCooldownAdapter } from '../abstract/BaseCooldownAdapter.js';
import { CooldownManager } from '../managers/CooldownManager.js';
import { PreconditionManager } from '../managers/PreconditionManager.js';
import { CooldownAdapter } from '../adapters/CooldownAdapter.js';
import { CommandManager } from '../managers/CommandManager.js';
import { BaseCommandPrecondition } from '../abstract/BaseCommandPrecondition.js';
import type { AnyCommandResolvable } from '../../helpers/types.js';
import { BaseCommand } from '../abstract/BaseCommand.js';
import { SlashCommand } from '../commands/SlashCommand.js';
import { ContextMenuCommand } from '../commands/ContextMenuCommand.js';
import { MessageCommand } from '../commands/MessageCommand.js';
import { PostconditionManager } from '../managers/PostconditionManager.js';
import { BaseCommandPostcondition } from '../abstract/BaseCommandPostcondition.js';

declare module "discord.js" {
    interface ClientOptions {
        modules?: Module.Resolvable[];
        preconditions?: BaseCommandPrecondition.Resolvable[];
        postconditions?: BaseCommandPostcondition.Resolvable[];
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
    private _postconditions: PostconditionManager|null = null;

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

    get postconditions() {
        return this._postconditions as If<Ready, PostconditionManager, null>;
    }

    public constructor(options: ClientOptions) {
        super(options);

        if (options.modules) for (const module of options.modules) {
            this.modules.cache.set(module.id, Module.from(module));
        }

        this._executeCommand = this._executeCommand.bind(this);
    }

    public async login(token: string): Promise<string> {
        this._commands = new CommandManager(this);
        this._cooldowns = new CooldownManager(this, this.options.cooldownAdapter ? new this.options.cooldownAdapter(this) : new CooldownAdapter(this));
        this._preconditions = new PreconditionManager(this);
        this._postconditions = new PostconditionManager(this);

        await this.modules.enableModules();

        if (this.options.preconditions) {
            for (const precondition of this.options.preconditions) {
                this._preconditions.cache.set(precondition.id, precondition instanceof BaseCommandPrecondition ? precondition : BaseCommandPrecondition.from(precondition));
            }
        }

        if (this.options.postconditions) {
            for (const postcondition of this.options.postconditions) {
                this._postconditions.cache.set(postcondition.id, postcondition instanceof BaseCommandPostcondition ? postcondition : BaseCommandPostcondition.from(postcondition));
            }
        }

        if (this.options.commands) {
            for (const command of this.options.commands) {
                this._commands.cache.set(command.id, command instanceof BaseCommand ? command : BaseCommand.createInstance(command));
            }
        }

        this.setMaxListeners(this.getMaxListeners() + 1);

        this.on('interactionCreate', this._executeCommand);
        this.on('messageCreate', this._executeCommand);

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
        this._postconditions = null;

        this.removeListener('interactionCreate', this._executeCommand);
        this.removeListener('messageCreate', this._executeCommand);

        this.setMaxListeners(this.getMaxListeners() - 1);

        return super.destroy();
    }

    private async _executeCommand(trigger: Interaction|Message): Promise<void> {
        if (!this.isReady()) return;

        if (trigger instanceof Message) {
            await MessageCommand.execute({
                client: this,
                message: trigger,
                prefix: '!'
            });
            return;
        }

        if (trigger.isChatInputCommand()) {
            await SlashCommand.execute({
                client: this,
                interaction: trigger
            });
        } else if (trigger.isContextMenuCommand()) {
            await ContextMenuCommand.execute({
                client: this,
                interaction: trigger
            });
        }
    }
}

export namespace Client {
    export interface Events extends ClientEvents {}
}
