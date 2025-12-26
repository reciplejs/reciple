import { type Interaction, type CacheType, type Awaitable, Collection } from 'discord.js';
import { ClientEventModule, type AnyModule } from 'reciple';
import { InteractionListener } from './InteractionListener.js';
import { InteractionListenerType } from '../helpers/constants.js';

export class InteractionEvents extends ClientEventModule<'interactionCreate'> implements InteractionEvents.Options {
    public readonly id: string = 'org.reciple.js.interaction-events';
    public event = 'interactionCreate' as const;
    public moduleEventListenersProperty: string|string[] = 'interactions';
    public ignoredModules?: (module: AnyModule) => Awaitable<boolean>;
    public listeners: Collection<string, InteractionListener<InteractionListenerType>> = new Collection();

    private readonly logger = useLogger().clone({ label: 'InteractionEvents' });

    constructor(options: InteractionEvents.Options = {}) {
        super();

        Object.assign(this, options);
    }

    public async onReady(): Promise<void> {
        this.client.modules.on('readyModules', async (modules: AnyModule[]) => {
            this.logger.debug(`Resolving listeners for ready modules...`);

            for (const listener of await this.resolveListeners(modules)) {
                this.listeners.set(listener.id, listener);
            }
        });

        this.client.modules.on('disabledModules', async (modules: AnyModule[]) => {
            this.logger.debug(`Sweeping listeners for disabled modules...`);

            for (const module of modules) {
                this.listeners.sweep(listener => listener.moduleId === module.id)
            }
        });
    }

    public async onEvent(interaction: Interaction<CacheType>): Promise<void> {
        const type = InteractionEvents.getInteractionTypeFromInteraction(interaction);
        const listeners = this.listeners.filter(listener => listener.type === type);

        this.logger.debug(`Triggered (${listeners.size}) listeners for interaction type "${type}".`);

        for (const [id, listener] of listeners) {
            if (!await Promise.resolve(listener.filter(interaction))) continue;

            await Promise.resolve(listener.execute(interaction));

            if (listener.once) {
                this.listeners.delete(id);
            }
        }
    }

    public async resolveListeners(customModules?: AnyModule[]) {
        this.logger.debug(`Resolving listeners from (${customModules?.length ?? this.client.modules.cache.size}) modules...`);

        const modules = (customModules ?? this.client.modules.cache.map(m => m)) as InteractionEvents.ListenerModule<string, InteractionListenerType>[];
        const listenersProperty = Array.isArray(this.moduleEventListenersProperty) ? this.moduleEventListenersProperty : [this.moduleEventListenersProperty];
        const listeners: InteractionListener<InteractionListenerType>[] = [];

        for (const module of modules) {
            if (module.id === this.id) continue;

            this.logger.debug(`Resolving listeners from module "${module.id}"...`);

            propertyLoop: for (const listenerProperty of listenersProperty) {
                if (!(listenerProperty in module)) continue propertyLoop;
                if (!Array.isArray(module[listenerProperty]) || !module[listenerProperty].length) continue;
                if (typeof this.ignoredModules === 'function' && await Promise.resolve(this.ignoredModules(module))) continue;

                const moduleListeners = module[listenerProperty];

                this.logger.debug(`Resolving listeners from module "${module.id}" with property "${listenerProperty}"...`);

                listenerLoop: for (const data of moduleListeners) {
                    const listener = InteractionListener.from(data);

                    Reflect.set(listener, 'moduleId', module.id);
                    listeners.push(listener);
                }

                this.logger.debug(`Resolved (${moduleListeners.length}) listeners from module "${module.id}" with property "${listenerProperty}".`);
            }
        }

        return listeners;
    }
}

export namespace InteractionEvents {
    export interface Options {
        /**
         * The property that is scanned from modules to get interaction listeners.
         */
        moduleEventListenersProperty?: string|string[];
        /**
         * Filter modules that should be ignored.
         */
        ignoredModules?: (module: AnyModule) => Awaitable<boolean>;
    }

    export type ListenerModule<P extends string, T extends InteractionListenerType> = AnyModule & Record<P, InteractionListener.Resolvable<T>[]>;

    export function getInteractionTypeFromInteraction(interaction: Interaction): InteractionListenerType {
        if (interaction.isAutocomplete()) {
            return InteractionListenerType.Autocomplete;
        } else if (interaction.isChatInputCommand()) {
            return InteractionListenerType.ChatInput;
        } else if (interaction.isContextMenuCommand()) {
            return InteractionListenerType.ContextMenu;
        } else if (interaction.isModalSubmit()) {
            return InteractionListenerType.ModalSubmit;
        } else if (interaction.isButton()) {
            return InteractionListenerType.Button;
        } else if (interaction.isAnySelectMenu()) {
            return InteractionListenerType.SelectMenu;
        } else if (interaction.isPrimaryEntryPointCommand()) {
            return InteractionListenerType.PrimaryEntryPoint;
        }

        throw new Error(`Unknown interaction type.`);
    }
}
