import { MessageCommand, MessageCommandBuilder } from '@reciple/core';
import { BaseModule } from '../BaseModule.js';
import { ModuleType } from '../../../helpers/constants.js';
import { DiscordSnowflake } from '@sapphire/snowflake';
import { hasMixin, mix } from 'ts-mixer';
import type { AnyCommandBuilderMethods } from '../../../helpers/types.js';

export interface MessageCommandModule extends Omit<BaseModule, 'moduleType'|'onEnable'|'onReady'|'onDisable'>, MessageCommandModule.MessageCommandWithoutBuilderMethods {
    onEnable(data: BaseModule.EventData<boolean>): Promise<void>;
    onReady(data: BaseModule.EventData<true>): Promise<void>;
    onDisable(data: BaseModule.EventData<boolean>): Promise<void>;
}

@mix(MessageCommand, BaseModule)
export abstract class MessageCommandModule implements MessageCommandModule {
    public readonly moduleType: ModuleType.Command = ModuleType.Command;
    public readonly id: string = DiscordSnowflake.generate().toString();

    public abstract data: MessageCommandBuilder.Data;

    public abstract execute(data: MessageCommand.ExecuteData): Promise<void>;

    public static from(data: MessageCommandModule.Resolvable): MessageCommandModule {
        if (hasMixin(data, MessageCommandModule)) return data;

        const ModuleInstance = class extends MessageCommandModule { data = data.data; execute = data.execute; };
        Object.assign(ModuleInstance.prototype, data);
        return new ModuleInstance();
    }
}

export namespace MessageCommandModule {
    export type Resolvable = MessageCommandModule|MessageCommandModule.Data;

    export interface Data extends Omit<BaseModule.Data, 'moduleType'>, Omit<MessageCommand.Data, 'id'> {
        moduleType: ModuleType.Command;
    }

    export type MessageCommandWithoutBuilderMethods = Omit<MessageCommand, AnyCommandBuilderMethods|'options'|'flags'>;
}

class Test extends MessageCommandModule {
    public data: MessageCommandBuilder.Data = new MessageCommandBuilder()
        .toJSON();

    public async execute(data: MessageCommand.ExecuteData): Promise<void> {
        
    }
}
