import { BaseModule } from '../BaseModule.js';
import { ModuleType } from '../../../helpers/constants.js';
import { DiscordSnowflake } from '@sapphire/snowflake';
import { hasMixin, mix } from 'ts-mixer';
import type { AnyCommandBuilderMethods } from '../../../helpers/types.js';
import { ContextMenuCommand, type ContextMenuCommandBuilder } from '@reciple/core';

export interface ContextMenuCommandModule extends Omit<BaseModule, 'moduleType'>, ContextMenuCommandModule.ContextMenuCommandWithoutBuilderMethods {}

@mix(BaseModule, ContextMenuCommand)
export abstract class ContextMenuCommandModule implements ContextMenuCommandModule {
    public readonly moduleType: ModuleType.Command = ModuleType.Command;
    public readonly id: string = DiscordSnowflake.generate().toString();

    public abstract data: ContextMenuCommandBuilder.Data;

    public abstract execute(data: ContextMenuCommand.ExecuteData): Promise<void>;

    public static from(data: ContextMenuCommandModule.Resolvable): ContextMenuCommandModule {
        if (hasMixin(data, ContextMenuCommandModule)) return data;

        const ModuleInstance = class extends ContextMenuCommandModule { data = data.data; execute = data.execute; };
        Object.assign(ModuleInstance.prototype, data);
        return new ModuleInstance();
    }
}

export namespace ContextMenuCommandModule {
    export type Resolvable = ContextMenuCommandModule|ContextMenuCommandModule.Data;

    export interface Data extends Omit<BaseModule.Data, 'moduleType'>, Omit<ContextMenuCommand.Data, 'id'> {
        moduleType: ModuleType.Command;
    }

    export type ContextMenuCommandWithoutBuilderMethods = Omit<ContextMenuCommand, AnyCommandBuilderMethods>;
}
