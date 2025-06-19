import type { ContextMenuCommandBuilder } from '../classes/builders/ContextMenuCommandBuilder.js';
import type { MessageCommandBuilder } from '../classes/builders/MessageCommandBuilder.js';
import type { SlashCommandBuilder } from '../classes/builders/SlashCommandBuilder.js';
import type { ContextMenuCommand } from '../classes/commands/ContextMenuCommand.js';
import type { MessageCommand } from '../classes/commands/MessageCommand.js';
import type { SlashCommand } from '../classes/commands/SlashCommand.js';
import type { CommandType } from './constants.js';

export type AnyCommand<T extends CommandType = CommandType> = T extends CommandType.Message
    ? MessageCommand
    : T extends CommandType.Slash
    ? SlashCommand
    : T extends CommandType.ContextMenu
    ? ContextMenuCommand
    : MessageCommand|SlashCommand|ContextMenuCommand;

export type AnyCommandData<T extends CommandType = CommandType> = T extends CommandType.Message
    ? MessageCommand.Data
    : T extends CommandType.Slash
    ? SlashCommand.Data
    : T extends CommandType.ContextMenu
    ? ContextMenuCommand.Data
    : MessageCommand.Data|SlashCommand.Data|ContextMenuCommand.Data;

export type AnyCommandResolvable<T extends CommandType = CommandType> = AnyCommand<T>|AnyCommandData<T>;

export type AnyCommandBuilder<T extends CommandType = CommandType> = T extends CommandType.Message
    ? MessageCommandBuilder
    : T extends CommandType.Slash
    ? SlashCommandBuilder
    : T extends CommandType.ContextMenu
    ? ContextMenuCommandBuilder
    : MessageCommandBuilder|SlashCommandBuilder|ContextMenuCommandBuilder;

export type AnyCommandBuilderData<T extends CommandType = CommandType> = T extends CommandType.Message
    ? MessageCommandBuilder.Data
    : T extends CommandType.Slash
    ? SlashCommandBuilder.Data
    : T extends CommandType.ContextMenu
    ? ContextMenuCommandBuilder.Data
    : MessageCommandBuilder.Data|SlashCommandBuilder.Data|ContextMenuCommandBuilder.Data;

export type AnyCommandExecuteData<T extends CommandType = CommandType> = T extends CommandType.Message
    ? MessageCommand.ExecuteData
    : T extends CommandType.Slash
    ? SlashCommand.ExecuteData
    : T extends CommandType.ContextMenu
    ? ContextMenuCommand.ExecuteData
    : MessageCommand.ExecuteData|SlashCommand.ExecuteData|ContextMenuCommand.ExecuteData;
