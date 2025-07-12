import { DiscordSnowflake } from '@sapphire/snowflake';
import type { Client } from './Client.js';

export class Module implements Module.Data {
    public readonly id: string = DiscordSnowflake.generate().toString();

    public async onEnable(data: Module.EventData<boolean>): Promise<void> {}

    public async onReady(data: Module.EventData<true>): Promise<void> {}

    public async onDisable(data: Module.EventData<boolean>): Promise<void> {}

    public static from(data: Module.Resolvable): Module {
        if (data instanceof Module) return data;

        const module = new (class extends Module { id = data.id; });
        Object.assign(module, data);
        return module;
    }
}

export namespace Module {
    export type Resolvable = Module|Data;

    export interface Data {
        id: string;
        onEnable(data: Module.EventData<false>): Promise<void>;
        onReady(data: Module.EventData<true>): Promise<void>;
        onDisable(data: Module.EventData<boolean>): Promise<void>;
    }

    export interface EventData<Ready extends boolean = boolean> {
        client: Client<Ready>;
    }
}
