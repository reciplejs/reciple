import { BaseModule } from '../BaseModule.js';
import { ModuleType } from '../../../helpers/constants.js';
import { DiscordSnowflake } from '@sapphire/snowflake';
import { hasMixin, mix } from 'ts-mixer';
import { SlashCommand, type SlashCommandBuilder } from '@reciple/core';
import type { AnyCommandBuilderMethods } from '../../../helpers/types.js';

export interface SlashCommandModule extends Omit<BaseModule, 'moduleType'>, SlashCommandModule.SlashCommandWithoutBuilderMethods {}

@mix(SlashCommand, BaseModule)
export abstract class SlashCommandModule implements SlashCommandModule {
    public readonly moduleType: ModuleType.Command = ModuleType.Command;
    public readonly id: string = DiscordSnowflake.generate().toString();

    public abstract data: SlashCommandBuilder.Data;

    public abstract execute(data: SlashCommand.ExecuteData): Promise<void>;

    public static from(data: SlashCommandModule.Resolvable): SlashCommandModule {
        if (hasMixin(data, SlashCommandModule)) return data;

        const ModuleInstance = class extends SlashCommandModule { data = data.data; execute = data.execute; };
        Object.assign(ModuleInstance.prototype, data);
        return new ModuleInstance();
    }
}

export namespace SlashCommandModule {
    export type Resolvable = SlashCommandModule|SlashCommandModule.Data;

    export interface Data extends Omit<BaseModule.Data, 'moduleType'>, Omit<SlashCommand.Data, 'id'> {
        moduleType: ModuleType.Command;
    }

    export type SlashCommandWithoutBuilderMethods = Omit<SlashCommand, AnyCommandBuilderMethods>;
}
