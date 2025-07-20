import { mix } from 'ts-mixer';
import { BaseModule } from '../modules/BaseModule.js';
import { BaseManager, RecipleError, type Client } from '@reciple/core';
import { EventEmitter } from 'node:events';
import type { AnyModule } from '../../helpers/types.js';
import { ModuleType } from '../../helpers/constants.js';

export interface ModuleManager extends BaseManager<string, AnyModule, BaseModule.Resolvable>, EventEmitter<ModuleManager.Events> {}

@mix(BaseManager, EventEmitter)
export class ModuleManager {
    public readonly holds = BaseModule;

    constructor(public readonly client: Client) {}

    public async enableModules({ modules, removeFromCacheOnError }: ModuleManager.EventExecuteData & { removeFromCacheOnError?: boolean; } = { modules: Array.from(this.cache.values()) }): Promise<AnyModule[]> {
        const enabledModules: AnyModule[] = [];

        for (const module of modules ?? []) {
            this.emit('modulePreEnable', module);

            await module.onEnable({ client: this.client }).catch(e => {
                if (removeFromCacheOnError) this.cache.delete(module.id);
                this.emitOrThrow('moduleEnableError', module, e);
            });

            this.emit('moduleEnable', module);
            this.add(module);
            enabledModules.push(module);
        }

        this.emit('enabledModules', enabledModules);
        return enabledModules;
    }

    public async readyModules({ modules, removeFromCacheOnError }: ModuleManager.EventExecuteData & { removeFromCacheOnError?: boolean; } = { modules: Array.from(this.cache.values()) }): Promise<AnyModule[]> {
        const readyModules: AnyModule[] = [];

        if (!this.client.isReady()) throw new RecipleError(RecipleError.Code.ClientNotReady());

        for (const module of modules ?? []) {
            this.emit('modulePreReady', module);

            await module.onReady({ client: this.client }).catch(e => {
                if (removeFromCacheOnError !== false) this.remove(module);
                this.emitOrThrow('moduleReadyError', module, e);
            });

            this.emit('moduleReady', module);
            this.cache.set(module.id, module);
            readyModules.push(module);
        }

        this.emit('readyModules', readyModules);
        return readyModules;
    }

    public async disableModules({ modules, removeFromCache }: ModuleManager.EventExecuteData & { removeFromCache?: boolean; } = { modules: Array.from(this.cache.values()) }): Promise<AnyModule[]> {
        const disabledModules: AnyModule[] = [];

        for (const module of modules ?? []) {
            this.emit('modulePreDisable', module);

            await module.onDisable({ client: this.client }).catch(e => {
                if (removeFromCache !== false) this.remove(module);
                this.emitOrThrow('moduleDisableError', module, e);
            });

            this.emit('moduleDisable', module);
            if (removeFromCache !== false) this.remove(module);
            disabledModules.push(module);
        }

        this.emit('disabledModules', disabledModules);
        return disabledModules;
    }

    public add(module: AnyModule): void {
        this.cache.set(module.id, module);
        switch (module.moduleType) {
            case ModuleType.Command:
                this.client.commands?.add(module);
                break;
            case ModuleType.Event:
                this.client.eventListeners.register(module);
                break;
            case ModuleType.Precondition:
                this.client.preconditions?.cache.set(module.id, module);
                break;
            case ModuleType.Postcondition:
                this.client.postconditions?.cache.set(module.id, module);
                break;
            case ModuleType.Base:
            default:
                break;
        }
    }

    public remove(module: AnyModule): void {
        this.cache.delete(module.id);
        switch (module.moduleType) {
            case ModuleType.Command:
                this.client.commands?.cache.delete(module.id);
                break;
            case ModuleType.Event:
                this.client.eventListeners.unregister(module);
                break;
            case ModuleType.Precondition:
                this.client.preconditions?.cache.delete(module.id);
                break;
            case ModuleType.Postcondition:
                this.client.postconditions?.cache.delete(module.id);
                break;
            case ModuleType.Base:
            default:
                break;
        }
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
        modulePreEnable: [module: AnyModule];
        moduleEnable: [module: AnyModule];
        moduleEnableError: [module: AnyModule, error: Error];
        enabledModules: [modules: AnyModule[]];

        modulePreReady: [module: AnyModule];
        moduleReady: [module: AnyModule];
        moduleReadyError: [module: AnyModule, error: Error];
        readyModules: [modules: AnyModule[]];

        modulePreDisable: [module: AnyModule];
        moduleDisable: [module: AnyModule];
        moduleDisableError: [module: AnyModule, error: Error];
        disabledModules: [modules: AnyModule[]];
    }

    export interface EventExecuteData {
        modules?: AnyModule[];
    }
}
