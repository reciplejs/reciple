import type { ContextMenuCommand } from '../classes/commands/ContextMenuCommand.js';
import type { MessageCommand } from '../classes/commands/MessageCommand.js';
import type { SlashCommand } from '../classes/commands/SlashCommand.js';
import type { CommandManager } from '../classes/managers/CommandManager.js';
import type { CooldownManager } from '../classes/managers/CooldownManager.js';
import type { PostconditionManager } from '../classes/managers/PostconditionManager.js';
import type { PreconditionManager } from '../classes/managers/PreconditionManager.js';
import type { CommandType } from './constants.js';

export interface Config extends Record<string|number|symbol, any> {
    commands?: Config.Commands;
    cooldowns?: CooldownManager.Options;
    preconditions?: Config.Preconditions;
    postconditions?: Config.Postconditions;
    applicationCommandsRegister?: Config.ApplicationCommandsRegister;
}

export namespace Config {
    export interface Commands {
        message?: MessageCommand;
        slash?: SlashCommand;
        contextMenu?: ContextMenuCommand;
    }

    export interface MessageCommand extends Omit<MessageCommand.ExecuteOptions, 'command'|'message'|'client'> {}

    export interface SlashCommand extends Omit<SlashCommand.ExecuteOptions, 'command'|'interaction'|'client'> {}

    export interface ContextMenuCommand extends Omit<ContextMenuCommand.ExecuteOptions, 'command'|'interaction'|'client'> {}

    export interface Preconditions extends Pick<PreconditionManager.ExecuteOptions<CommandType, any>, 'returnOnFailure'> {}

    export interface Postconditions extends Pick<PostconditionManager.ExecuteOptions<CommandType, any>, 'returnOnFailure'> {}

    export interface ApplicationCommandsRegister extends Omit<CommandManager.RegisterApplicationCommandsOptions, 'commands'> {}
}
