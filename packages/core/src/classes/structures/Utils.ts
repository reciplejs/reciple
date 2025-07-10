import type { Collection } from 'discord.js';
import { CommandPostconditionReason, CommandType } from '../../helpers/constants.js';
import type { AnyCommand, AnyCommandBuilder, AnyCommandData, AnyCommandExecuteData } from '../../helpers/types.js';
import { ContextMenuCommandBuilder } from '../builders/ContextMenuCommandBuilder.js';
import { MessageCommandBuilder } from '../builders/MessageCommandBuilder.js';
import { SlashCommandBuilder } from '../builders/SlashCommandBuilder.js';
import { ContextMenuCommand } from '../commands/ContextMenuCommand.js';
import { MessageCommand } from '../commands/MessageCommand.js';
import { SlashCommand } from '../commands/SlashCommand.js';
import { RecipleError } from './RecipleError.js';
import type { BaseCommandPrecondition } from '../abstract/BaseCommandPrecondition.js';

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

    export function createCommandBuilderInstance<T extends CommandType>(type: T): AnyCommandBuilder<T> {
        switch (type) {
            case CommandType.Message:
                return new MessageCommandBuilder() as AnyCommandBuilder<T>;
            case CommandType.Slash:
                return new SlashCommandBuilder() as AnyCommandBuilder<T>;
            case CommandType.ContextMenu:
                return new ContextMenuCommandBuilder() as AnyCommandBuilder<T>;
        }
    }

    export async function executeCommandPreconditions<T extends CommandType>(data: AnyCommandExecuteData<T>): Promise<AnyCommandExecuteData<T>|null> {
        await data.client.preconditions.execute({ data });

        if (data.preconditionResults.hasErrors) {
            const results = await data.client.postconditions.execute<CommandType, unknown>({
                data: {
                    reason: CommandPostconditionReason.PreconditionError,
                    preconditionResult: data.preconditionResults,
                    executeData: data
                }
            });

            if (!results.cache.some(result => result.success)) {
                throw new RecipleError(RecipleError.Code.PreconditionError(data.preconditionResults.errors));
            }

            return data;
        }

        if (data.preconditionResults.postconditionExecutes.length) {
            const withPostconditionData = (data.preconditionResults.cache as Collection<string, BaseCommandPrecondition.ResultData<CommandType>>)
                .filter(result => !!result.postconditionExecute);

            for (const [id, result] of withPostconditionData) {
                const postconditionExecute = result.postconditionExecute!;

                await data.client.postconditions.execute<CommandType, unknown>({
                    data: postconditionExecute.data!,
                    allowedPostconditions: postconditionExecute.allowedPostconditions,
                    preconditionTrigger: result
                });
            }

            return data;
        } else if (data.preconditionResults.hasFailures) {
            await data.client.postconditions.execute<CommandType, unknown>({
                data: {
                    reason: CommandPostconditionReason.PreconditionFailure,
                    preconditionResult: data.preconditionResults,
                    executeData: data
                }
            });

            return data;
        }

        return null;
    }
}
