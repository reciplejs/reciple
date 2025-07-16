import { mix } from 'ts-mixer';
import { BaseModule } from '../modules/BaseModule.js';
import { BaseManager, RecipleError, type Client } from '@reciple/core';
import EventEmitter from 'node:events';
import type { AnyModule } from '../../helpers/types.js';

export interface ModuleManager extends BaseManager<string, AnyModule, BaseModule.Resolvable>, EventEmitter<ModuleManager.Events> {}

@mix(BaseManager, EventEmitter)
export class ModuleManager {
    public readonly holds = BaseModule;

    public constructor(public readonly client: Client) {}

    public async enableModules({ modules }: ModuleManager.EventExecuteData = { modules: Array.from(this.cache.values()) }): Promise<AnyModule[]> {
        const enabledModules: AnyModule[] = [];

        for (const module of modules ?? []) {
            this.emit('modulePreEnable', module);

            await module.onEnable({ client: this.client }).catch(e => this.emitOrThrow('moduleEnableError', module, e));

            this.emit('moduleEnable', module);
            this.cache.set(module.id, module);
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

    public async disableModules({ modules, removeFromCache }: ModuleManager.EventExecuteData & { removeFromCache?: boolean; } = { modules: Array.from(this.cache.values()) }): Promise<AnyModule[]> {
        const disabledModules: AnyModule[] = [];

        for (const module of modules ?? []) {
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
