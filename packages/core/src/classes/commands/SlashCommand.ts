import type { ChatInputCommandInteraction } from 'discord.js';
import { CommandType } from '../../helpers/constants.js';
import { BaseCommand } from '../abstract/BaseCommand.js';

export class SlashCommand extends BaseCommand<CommandType.Slash> {
    public readonly type: CommandType.Slash = CommandType.Slash;

    public constructor(data?: Partial<SlashCommand.Data>) {
        super(data);
    }

    public toJSON(): SlashCommand.Data {
        return super.toJSON();
    }
}

export namespace SlashCommand {
    export interface Data extends BaseCommand.Data<CommandType.Slash> {}

    export interface ExecuteData extends BaseCommand.ExecuteData<CommandType.Slash> {
        interaction: ChatInputCommandInteraction;
    }

    export interface ExecuteOptions extends BaseCommand.ExecuteOptions<CommandType.Slash> {
        interaction: ChatInputCommandInteraction;
    }
}
