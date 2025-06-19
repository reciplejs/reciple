import type { MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction } from 'discord.js';
import { CommandType } from '../../helpers/constants.js';
import { BaseCommand } from '../abstract/BaseCommand.js';

export class ContextMenuCommand extends BaseCommand<CommandType.ContextMenu> {
    public readonly type: CommandType.ContextMenu = CommandType.ContextMenu;

    public constructor(data?: Partial<ContextMenuCommand.Data>) {
        super(data);
    }

    public toJSON(): ContextMenuCommand.Data {
        return super.toJSON();
    }
}

export namespace ContextMenuCommand {
    export interface Data extends BaseCommand.Data<CommandType.ContextMenu> {}

    export interface ExecuteData extends BaseCommand.ExecuteData<CommandType.ContextMenu> {
        interaction: UserContextMenuCommandInteraction|MessageContextMenuCommandInteraction;
    }

    export interface ExecuteOptions extends BaseCommand.ExecuteOptions<CommandType.ContextMenu> {
        interaction: UserContextMenuCommandInteraction|MessageContextMenuCommandInteraction;
    }
}
