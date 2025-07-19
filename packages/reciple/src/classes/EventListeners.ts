import type { Client } from '@reciple/core';
import type { EventEmitter } from 'node:events';
import type { ModuleManager } from './managers/ModuleManager.js';
import { BaseModule } from './modules/BaseModule.js';
import { colors } from '@reciple/utils';
import type { ModuleLoader } from './ModuleLoader.js';

export class EventListeners {
    public registeredEvents: EventListeners.RegisteredEvent[] = [];

    public register(event: EventListeners.RegisteredEvent): this {
        if (event.once) {
            event.emitter.once(event.event, event.onEvent);
        } else {
            event.emitter.on(event.event, event.onEvent);
        }

        this.registeredEvents.push(event);
        return this;
    }

    public unregister(event: EventListeners.RegisteredEvent): this {
        event.emitter.removeListener(event.event, event.onEvent);
        this.registeredEvents = this.registeredEvents.filter(e => e !== event);
        return this;
    }

    public unregisterAll(): this {
        this.registeredEvents.forEach(event => this.unregister(event));
        this.registeredEvents = [];
        return this;
    }

    public registerProcessExitEvents(listener: (signal: NodeJS.Signals) => any): this {
        for (const event of EventListeners.processExitEvents) {
            this.register({ emitter: process, event, onEvent: listener });
        }

        return this;
    }

    public unregisterProcessExitEvents(listener: (signal: NodeJS.Signals) => any): this {
        for (const event of EventListeners.processExitEvents) {
            this.unregister({ emitter: process, event, onEvent: listener });
        }

        return this;
    }
}

export namespace EventListeners {
    export const processExitEvents = [
        'SIGHUP',
        'SIGINT',
        'SIGQUIT',
        'SIGABRT',
        'SIGALRM',
        'SIGTERM',
        'SIGBREAK',
        'SIGUSR2',
    ];

    export interface RegisteredEvent {
        event: string|symbol;
        emitter: EventEmitter;
        once?: boolean;
        onEvent: (...args: any) => any;
    }

    export function registerModuleEventListeners(client: Client) {
        const defineModuleManagerEvent = <E extends keyof ModuleManager.Events>(event: E, onEvent: (...args: ModuleManager.Events[E]) => any): RegisteredEvent => ({ emitter: client.modules, event, onEvent });
        const defineModuleLoaderEvent = <E extends keyof ModuleLoader.Events>(event: E, onEvent: (...args: ModuleLoader.Events[E]) => any): RegisteredEvent => ({ emitter: client.moduleLoader, event, onEvent });

        const events: RegisteredEvent[] = [
            defineModuleManagerEvent('modulePreEnable', (module) => client.logger.log(`Enabling module ${colors.cyan(`"${BaseModule.getFilepath(module) || module.id}"`)}`)),
            defineModuleManagerEvent('moduleEnable', (module) => client.logger.log(`Enabled module ${colors.cyan(`"${BaseModule.getFilepath(module) || module.id}"`)}`)),
            defineModuleManagerEvent('modulePreReady', (module) => client.logger.log(`Readying module ${colors.cyan(`"${BaseModule.getFilepath(module) || module.id}"`)}`)),
            defineModuleManagerEvent('moduleReady', (module) => client.logger.log(`Ready module ${colors.cyan(`"${BaseModule.getFilepath(module) || module.id}"`)}`)),
            defineModuleManagerEvent('modulePreDisable', (module) => client.logger.log(`Disabling module ${colors.cyan(`"${BaseModule.getFilepath(module) || module.id}"`)}`)),
            defineModuleManagerEvent('moduleDisable', (module) => client.logger.log(`Disabled module ${colors.cyan(`"${BaseModule.getFilepath(module) || module.id}"`)}`)),
            defineModuleManagerEvent('moduleEnableError', (module, error) => client.logger.error(`Failed to enable module ${colors.cyan(`"${BaseModule.getFilepath(module) || module.id}"`)}:`, error)),
            defineModuleManagerEvent('moduleReadyError', (module, error) => client.logger.error(`Failed to ready module ${colors.cyan(`"${BaseModule.getFilepath(module) || module.id}"`)}:`, error)),
            defineModuleManagerEvent('moduleDisableError', (module, error) => client.logger.error(`Failed to disable module ${colors.cyan(`"${BaseModule.getFilepath(module) || module.id}"`)}:`, error)),
            defineModuleLoaderEvent('modulesResolving', () => client.logger.log('Resolving modules...')),
            defineModuleLoaderEvent('modulesResolved', (modules) => client.logger.log(`Resolved ${colors.green(modules.length)} modules.`)),
            defineModuleLoaderEvent('moduleResolving', (filepath) => client.logger.debug(`Resolving module ${colors.cyan(`"${filepath}"`)}...`)),
            defineModuleLoaderEvent('moduleResolved', (module) => client.logger.debug(`Resolved module ${colors.cyan(`"${BaseModule.getFilepath(module) || module.id}"`)}:`, module)),
            defineModuleLoaderEvent('moduleResolveError', (error) => client.logger.error(`Failed to resolve module:`, error)),
        ];

        for (const event of events) {
            client.eventListeners.register(event);
        }
    }
}
