import { bold, red } from 'kleur/colors';
import { stripVTControlCharacters } from 'node:util';
import type { AnyCommand } from '../../helpers/types.js';
import { CommandType } from '../../helpers/constants.js';

export class RecipleError extends Error {
    get cleanStack() {
        return this.stack && stripVTControlCharacters(this.stack)
    }

    constructor(options: RecipleError.Options|string) {
        options = typeof options === 'string' ? { message: options } : options;
        if ('cause' in options) options.cause = ['string', 'boolean', 'number', 'symbol', 'bigint'].includes(typeof options.cause) ? new RecipleError(String(options.cause)) : options.cause;

        super(options.message, { ...options });

        if (options.name) this.name = bold(red(options.name));
    }

    public toString() {
        return stripVTControlCharacters(super.toString());
    }
}

export namespace RecipleError {
    export interface Options {
        name?: string;
        message: string;
        cause?: unknown;
    }

    export const Code = {
        NotImplemented: () => ({
            name: 'NotImplemented',
            message: 'This functionality is not yet implemented.',
        }),
        ClientNotReady: () => ({
            name: 'ClientNotReady',
            message: 'The client is not yet ready. Please wait until the client is logged in before using this functionality.',
        }),
        PreconditionError: (errors: unknown[]) => ({
            name: 'PreconditionError',
            message: `${errors.length} precondition${errors.length === 1 ? '' : 's'} failed while executing.`,
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
        })
    } as const;
}
