import { Client as DiscordJsClient, Message, type Awaitable, type ClientEvents, type ClientOptions, type If, type Interaction } from 'discord.js';
import { BaseCooldownAdapter } from '../abstract/BaseCooldownAdapter.js';
import { CooldownManager } from '../managers/CooldownManager.js';
import { PreconditionManager } from '../managers/PreconditionManager.js';
import { CooldownAdapter } from '../adapters/CooldownAdapter.js';
import { CommandManager } from '../managers/CommandManager.js';
import { CommandPrecondition } from './CommandPrecondition.js';
import type { AnyCommandResolvable } from '../../helpers/types.js';
import { BaseCommand } from '../abstract/BaseCommand.js';
import { SlashCommand } from '../commands/SlashCommand.js';
import { ContextMenuCommand } from '../commands/ContextMenuCommand.js';
import { MessageCommand } from '../commands/MessageCommand.js';
import { PostconditionManager } from '../managers/PostconditionManager.js';
import { CommandPostcondition } from './CommandPostcondition.js';
import { Utils } from './Utils.js';
import type { Config } from '../../helpers/config.js';

declare module "discord.js" {
    interface ClientOptions {
        token?: string;
        preconditions?: CommandPrecondition.Resolvable[];
        postconditions?: CommandPostcondition.Resolvable[];
        commands?: AnyCommandResolvable[];
        cooldownAdapter?: BaseCooldownAdapter|BaseCooldownAdapter.Constructor;
        config?: Config;
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
    private _commands: CommandManager|null = null;
    private _cooldowns: CooldownManager<BaseCooldownAdapter>|null = null;
    private _preconditions: PreconditionManager|null = null;
    private _postconditions: PostconditionManager|null = null;

    private _onBeforeDestroy: null|((client: Client) => Awaitable<void>) = null;

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

    get config() {
        return this.options.config;
    }

    set config(config: Config|undefined) {
        this.options.config = config;
    }

    public constructor(options: ClientOptions) {
        super(options);

        this._executeCommand = this._executeCommand.bind(this);
    }

    public async login(token: string|undefined = this.options.token): Promise<string> {
        this._commands = new CommandManager(this);
        this._cooldowns = new CooldownManager(this,
            this.options.cooldownAdapter instanceof BaseCooldownAdapter
                ? this.options.cooldownAdapter
                : this.options.cooldownAdapter
                    ? new this.options.cooldownAdapter()
                    : new CooldownAdapter()
        );
        this._preconditions = new PreconditionManager(this);
        this._postconditions = new PostconditionManager(this);

        await this.cooldowns?.adapter.$init(this as Client<false>);

        if (this.options.preconditions) {
            for (const precondition of this.options.preconditions) {
                this._preconditions.cache.set(precondition.id, precondition instanceof CommandPrecondition ? precondition : CommandPrecondition.from(precondition));
            }
        }

        if (this.options.postconditions) {
            for (const postcondition of this.options.postconditions) {
                this._postconditions.cache.set(postcondition.id, postcondition instanceof CommandPostcondition ? postcondition : CommandPostcondition.from(postcondition));
            }
        }

        if (this.options.commands) {
            for (const command of this.options.commands) {
                this._commands.cache.set(command.id, command instanceof BaseCommand ? command : Utils.createCommandInstance(command));
            }
        }

        this.setMaxListeners(this.getMaxListeners() + 1);

        this.on('interactionCreate', this._executeCommand);
        this.on('messageCreate', this._executeCommand);

        this.once('ready', async () => {
            this.setMaxListeners(this.getMaxListeners() - 1);
            this.cooldowns?.createSweeper();
        });

        return super.login(token);
    }

    public async destroy(): Promise<void> {
        await this._onBeforeDestroy?.(this);

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
                ...this.config?.commands?.message,
                client: this,
                message: trigger
            });
            return;
        }

        if (trigger.isChatInputCommand()) {
            await SlashCommand.execute({
                ...this.config?.commands?.slash,
                client: this,
                interaction: trigger
            });
        } else if (trigger.isContextMenuCommand()) {
            await ContextMenuCommand.execute({
                ...this.config?.commands?.contextMenu,
                client: this,
                interaction: trigger
            });
        }
    }
}

export namespace Client {
    export interface Events extends ClientEvents {}
}
