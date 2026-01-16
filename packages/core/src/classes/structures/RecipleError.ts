import { stripVTControlCharacters, styleText } from 'node:util';
import type { AnyCommand } from '../../helpers/types.js';
import { CommandType } from '../../helpers/constants.js';
import { MessageCommand } from '../commands/MessageCommand.js';
import type { MessageCommandOption } from './MessageCommandOption.js';
import type { MessageCommandFlag } from './MessageCommandFlag.js';

export class RecipleError extends Error {
    get cleanStack() {
        return this.stack && stripVTControlCharacters(this.stack)
    }

    constructor(options: RecipleError.Options|string) {
        options = typeof options === 'string' ? { message: options } : options;
        if ('cause' in options) options.cause = ['string', 'boolean', 'number', 'symbol', 'bigint'].includes(typeof options.cause) ? new RecipleError(String(options.cause)) : options.cause;

        super(options.message, { ...options });

        if (options.name) this.name = styleText(['red', 'bold'], options.name);
    }

    public toString() {
        return stripVTControlCharacters(super.toString());
    }

    public static fromArray(errors: Error[]) {
        if (errors.length === 1) return errors[0];
        return new RecipleError(RecipleError.Code.MultipleErrors(errors));
    }
}

export namespace RecipleError {
    export interface Options {
        name?: string;
        message: string;
        cause?: unknown;
    }

    export const Code = {
        MultipleErrors: (errors: Error[]) => ({
            name: 'MultipleErrors',
            message: `${errors.length} error${errors.length === 1 ? '' : 's'} occurred while executing.`,
            cause: errors.length === 1 ? errors[0] : errors,
        }),
        NotImplemented: () => ({
            name: 'NotImplemented',
            message: 'This functionality is not yet implemented.',
        }),
        UnknownCommandType: (type: string) => ({
            name: 'UnknownCommandType',
            message: `The command type (${type}) is unknown.`,
        }),
        ClientNotReady: () => ({
            name: 'ClientNotReady',
            message: 'The client is not yet ready. Please wait until the client is logged in before using this functionality.',
        }),
        ClientAlreadyReady: () => ({
            name: 'ClientAlreadyReady',
            message: 'The client is already ready.',
        }),
        PreconditionError: (errors: unknown[]) => ({
            name: 'PreconditionError',
            message: `${errors.length} precondition${errors.length === 1 ? '' : 's'} failed while executing.`,
            cause: errors.length === 1 ? errors[0] : errors,
        }),
        PostconditionError: (errors: unknown[]) => ({
            name: 'PostconditionError',
            message: `${errors.length} postcondition${errors.length === 1 ? '' : 's'} failed while executing.`,
            cause: errors.length === 1 ? errors[0] : errors,
        }),
        CommandExecuteError: (command: AnyCommand, cause: unknown) => ({
            name: 'CommandExecuteError',
            message: `An error occurred while executing the command (${CommandType[command.type]}: ${command.data.name}).`,
            cause,
        }),
        CommandAlreadyExists: (command: AnyCommand) => ({
            name: 'CommandAlreadyExists',
            message: `The command (${CommandType[command.type]}: ${command.data.name}) already exists.`,
        }),
        MessageCommandMissingRequiredOption: (command: MessageCommand, option: MessageCommandOption<any>) => ({
            name: 'MessageCommandMissingRequiredOption',
            message: `The command (${CommandType[command.type]}: ${command.data.name}) is missing a required option (${option.name}).`,
        }),
        MessageCommandMissingRequiredFlag: (command: MessageCommand, flag: MessageCommandFlag<any>) => ({
            name: 'MessageCommandMissingRequiredFlag',
            message: `The command (${CommandType[command.type]}: ${command.data.name}) is missing a required flag (${flag.name}).`,
        }),
        MessageCommandInvalidOption: (command: MessageCommand, option: MessageCommandOption<any>, reason?: unknown) => ({
            name: 'MessageCommandInvalidOption',
            message: `The command (${CommandType[command.type]}: ${command.data.name}) has an invalid option (${option.name}).`,
            cause: reason
        }),
        MessageCommandInvalidFlag: (command: MessageCommand, flag: MessageCommandFlag<any>, reason?: unknown) => ({
            name: 'MessageCommandInvalidFlag',
            message: `The command (${CommandType[command.type]}: ${command.data.name}) has an invalid flag (${flag.name}).`,
            cause: reason
        }),
        MessageCommandUnknownOption: (command: MessageCommand, option: string) => ({
            name: 'MessageCommandUnknownOption',
            message: `The command (${CommandType[command.type]}: ${command.data.name}) does not have an option (${option}).`,
        }),
        MessageCommandUnknownFlag: (command: MessageCommand, flag: string) => ({
            name: 'MessageCommandUnknownFlag',
            message: `The command (${CommandType[command.type]}: ${command.data.name}) does not have a flag (${flag}).`,
        }),
    } as const;
}
