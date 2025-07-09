import { CommandType } from '../../helpers/constants.js';
import type { AnyCommand, AnyCommandData } from '../../helpers/types.js';
import { ContextMenuCommand } from '../commands/ContextMenuCommand.js';
import { MessageCommand } from '../commands/MessageCommand.js';
import { SlashCommand } from '../commands/SlashCommand.js';

export namespace Utils {
    export function createCommandInstance<T extends CommandType>(data: Omit<Partial<AnyCommandData<T>>, 'type'> & { type: T }): AnyCommand<T> {
        switch (data.type) {
            case CommandType.Message:
                return new MessageCommand(data as MessageCommand.Data) as AnyCommand<T>;
            case CommandType.Slash:
                return new SlashCommand(data as SlashCommand.Data) as AnyCommand<T>;
            case CommandType.ContextMenu:
                return new ContextMenuCommand(data as ContextMenuCommand.Data) as AnyCommand<T>;
        }
    }
}
