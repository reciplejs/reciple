import { mix } from 'ts-mixer';
import { Module } from '../structures/Module.js';
import { BaseManager } from '../abstract/BaseManager.js';
import EventEmitter from 'node:events';
import type { Client } from '../structures/Client.js';

export interface ModuleManager extends BaseManager<string, Module, Module.Resolvable>, EventEmitter<ModuleManager.Events> {}

@mix(BaseManager, EventEmitter)
export class ModuleManager {
    public readonly holds = Module;

    public constructor(public readonly client: Client) {}

    public async enableModules({ modules }: ModuleManager.EventExecuteData = { modules: Array.from(this.cache.values()) }): Promise<Module[]> {
        const enabledModules: Module[] = [];

        for (const resolvable of modules ?? []) {
            const module = Module.from(resolvable);

            this.emit('modulePreEnable', module);

            await module.onEnable({ client: this.client }).catch(e => this.emitOrThrow('moduleEnableError', module, e));

            this.emit('moduleEnable', module);
            this.cache.set(module.id, module);
            enabledModules.push(module);
        }

        this.emit('enabledModules', enabledModules);
        return enabledModules;
    }

    public async readyModules({ modules, removeFromCacheOnError }: ModuleManager.EventExecuteData & { removeFromCacheOnError?: boolean; } = { modules: Array.from(this.cache.values()) }): Promise<Module[]> {
        const readyModules: Module[] = [];

        if (!this.client.isReady()) {
            // TODO: Throw custom error
            throw new Error('Client is not ready');
        }

        for (const resolvable of modules ?? []) {
            const module = Module.from(resolvable);

            this.emit('modulePreReady', module);

            await module.onReady({ client: this.client }).catch(e => {
                if (removeFromCacheOnError !== false) this.cache.delete(module.id);
                this.emitOrThrow('moduleReadyError', module, e);
            });

            this.emit('moduleReady', module);
            this.cache.set(module.id, module);
            readyModules.push(module);
        }

        this.emit('readyModules', readyModules);
        return readyModules;
    }

    public async disableModules({ modules, removeFromCache }: ModuleManager.EventExecuteData & { removeFromCache?: boolean; } = { modules: Array.from(this.cache.values()) }): Promise<Module[]> {
        const disabledModules: Module[] = [];

        for (const resolvable of modules ?? []) {
            const module = Module.from(resolvable);

            this.emit('modulePreDisable', module);

            await module.onDisable({ client: this.client }).catch(e => this.emitOrThrow('moduleDisableError', module, e));

            this.emit('moduleDisable', module);
            if (removeFromCache) this.cache.delete(module.id);
            disabledModules.push(module);
        }

        this.emit('disabledModules', disabledModules);
        return disabledModules;
    }

    private emitOrThrow<K extends keyof Pick<ModuleManager.Events, 'moduleDisableError'|'moduleEnableError'|'moduleReadyError'>>(event: K, ...args: ModuleManager.Events[K]) {
        if (this.client.listenerCount(event) > 0) {
            return this.emit(event, ...(args as never));
        }

        throw args[1];
    }
}

export namespace ModuleManager {
    export interface Events {
        modulePreEnable: [module: Module];
        moduleEnable: [module: Module];
        moduleEnableError: [module: Module, error: Error];
        enabledModules: [modules: Module[]];

        modulePreReady: [module: Module];
        moduleReady: [module: Module];
        moduleReadyError: [module: Module, error: Error];
        readyModules: [modules: Module[]];

        modulePreDisable: [module: Module];
        moduleDisable: [module: Module];
        moduleDisableError: [module: Module, error: Error];
        disabledModules: [modules: Module[]];
    }

    export interface EventExecuteData {
        modules?: Module.Resolvable[];
    }
}
