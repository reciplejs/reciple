import type { BaseModule } from '../classes/modules/BaseModule.js';
import type { ContextMenuCommandModule } from '../classes/modules/commands/ContextMenuCommandModule.js';
import type { EventModule } from '../classes/modules/events/EventModule.js';
import type { MessageCommandModule } from '../classes/modules/commands/MessageCommandModule.js';
import type { PostconditionModule } from '../classes/modules/PostconditionModule.js';
import type { PreconditionModule } from '../classes/modules/PreconditionModule.js';
import type { SlashCommandModule } from '../classes/modules/commands/SlashCommandModule.js';
import type { CommandType } from '@reciple/core';
import type { UserConfig } from 'tsdown';
import type { ShardingManagerOptions } from 'discord.js';

export type AnyCommandBuilderMethods =
    |'setCommand'
    |'setCommand'
    |'setCooldown'
    |'addPreconditions'
    |'setPreconditions'
    |'addPostconditions'
    |'setPostconditions'
    |'addDisabledPreconditions'
    |'setDisabledPreconditions'
    |'addDisabledPostconditions'
    |'setDisabledPostconditions'
    |'setExecute';

export type AnyModule =
    |BaseModule
    |AnyCommandModule
    |PreconditionModule
    |PostconditionModule
    |EventModule;

export type AnyModuleData =
    |BaseModule.Data
    |AnyCommandModuleData
    |PreconditionModule.Data
    |PostconditionModule.Data
    |EventModule.Data;

export type AnyCommandModule<T extends CommandType = CommandType> = T extends CommandType.Message
    ? MessageCommandModule
    : T extends CommandType.Slash
        ? SlashCommandModule
        : T extends CommandType.ContextMenu
            ? ContextMenuCommandModule
            : MessageCommandModule|SlashCommandModule|ContextMenuCommandModule;

export type AnyCommandModuleData<T extends CommandType = CommandType> = T extends CommandType.Message
    ? MessageCommandModule.Data
    : T extends CommandType.Slash
        ? SlashCommandModule.Data
        : T extends CommandType.ContextMenu
            ? ContextMenuCommandModule.Data
            : MessageCommandModule.Data|SlashCommandModule.Data|ContextMenuCommandModule.Data;

export type BuildConfig = Omit<UserConfig,
    |'watch'
    |'skipNodeModulesBundle'
    |'platform'
    |'format'
    |'unbundle'
    |'bundle'
    |'skipNodeModulesBundle'
    |'noExternal'
    |'cjsDefault'
    |'workspace'
    |'customLogger'
    |'logLevel'
    |'deps'>;

export type ShardingConfig = Omit<ShardingManagerOptions, 'shardArgs'|'token'|'execArgv'>;
