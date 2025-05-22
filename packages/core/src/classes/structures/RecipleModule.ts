import type { RecipleClient } from './RecipleClient.js';

export abstract class RecipleModule implements RecipleModule.Data {
    public abstract id: string;
    public name?: string;
    public version?: string;
    public supports?: RecipleModule.VersionSupportData[];

    public async onEnable(data: RecipleModule.StateChangeData): Promise<void> {}
    public async onReady(data: RecipleModule.StateChangeData): Promise<void> {}
    public async onDisable(data: RecipleModule.StateChangeData): Promise<void> {}

    public static from(data: RecipleModule.Data): RecipleModule {
        const instance = new class extends RecipleModule { public id = data.id; }
        return Object.assign(instance, data);
    }
}

export namespace RecipleModule {
    export interface Data {
        id: string;
        name?: string;
        version?: string;
        supports?: VersionSupportData[];

        onEnable?(data: StateChangeData): Promise<void>;
        onReady?(data: StateChangeData): Promise<void>;
        onDisable?(data: StateChangeData): Promise<void>;
    }

    export interface StateChangeData<Ready extends boolean = boolean> {
        client: RecipleClient<Ready>;
        module: RecipleModule;
    }

    export interface VersionSupportData {
        core?: string;
        discordjs?: string;
    }
}
