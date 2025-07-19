import type { Client } from '@reciple/core';
import { DiscordSnowflake } from '@sapphire/snowflake';
import { ModuleType } from '../../helpers/constants.js';
import { hasMixin } from 'ts-mixer';
import type { AnyModule } from '../../helpers/types.js';

export class BaseModule implements BaseModule.Data {
    private readonly __$filepath: string = '';

    public readonly id: string = DiscordSnowflake.generate().toString();
    public readonly moduleType: ModuleType.Base = ModuleType.Base;

    public client!: Client;

    public async onEnable(data: BaseModule.EventData<boolean>): Promise<void> {}

    public async onReady(data: BaseModule.EventData<true>): Promise<void> {}

    public async onDisable(data: BaseModule.EventData<boolean>): Promise<void> {}

    public static isModule(data: unknown): data is AnyModule {
        return data instanceof BaseModule || hasMixin(data, BaseModule);
    }

    public static from(data: BaseModule.Resolvable): BaseModule {
        if (data instanceof BaseModule || hasMixin(data, BaseModule)) return data;

        const ModuleInstance = class extends BaseModule {};
        Object.assign(ModuleInstance.prototype, data);
        return new ModuleInstance();
    }

    public static getFilepath(module: AnyModule): string {
        return (module as BaseModule).__$filepath || '';
    }
}

export namespace BaseModule {
    export type Resolvable = BaseModule|Data;

    export const constructor = BaseModule;

    export interface Data {
        id?: string;
        moduleType?: ModuleType.Base;
        onEnable?(data: BaseModule.EventData<false>): Promise<void>;
        onReady?(data: BaseModule.EventData<true>): Promise<void>;
        onDisable?(data: BaseModule.EventData<boolean>): Promise<void>;
    }

    export interface EventData<Ready extends boolean = boolean> {
        client: Client<Ready>;
    }
}
