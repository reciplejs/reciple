import { CommandPostconditionReason, CommandType } from '../../helpers/constants.js';
import type { AnyCommandExecuteData } from '../../helpers/types.js';
import { CommandPrecondition } from '../structures/CommandPrecondition.js';
import { RecipleError } from '../structures/RecipleError.js';

export class MessageCommandValidationPrecondition extends CommandPrecondition {
    public scope = [CommandType.Message];

    public async execute<T extends CommandType>(data: AnyCommandExecuteData<T>): Promise<CommandPrecondition.ResultDataResolvable<T, any>> {
        if (data.type !== CommandType.Message) return true;

        const invalidOptions = await data.options.getInvalidOptions();
        const invalidFlags = await data.flags.getInvalidFlags();

        if (invalidOptions.length) {
            const invalid = invalidOptions.filter(o => o.missing === false);
            const missing = invalidOptions.filter(o => o.missing === true);

            if (invalid.length) {
                return {
                    success: false,
                    error: RecipleError.fromArray(
                        invalid.map(o => o.error as RecipleError ?? new RecipleError(RecipleError.Code.MessageCommandInvalidOption(data.command, o.option)))
                    ),
                    postconditionExecute: {
                        data: {
                            reason: CommandPostconditionReason.InvalidArgs,
                            executeData: data
                        }
                    }
                }
            }

            if (missing.length) {
                return {
                    success: false,
                    error: RecipleError.fromArray(
                        missing.map(o => new RecipleError(RecipleError.Code.MessageCommandMissingRequiredOption(data.command, o.option)))
                    ),
                    postconditionExecute: {
                        data: {
                            reason: CommandPostconditionReason.MissingArgs,
                            executeData: data
                        }
                    }
                }
            }
        }

        if (invalidFlags.length) {
            const invalid = invalidFlags.filter(f => f.missing === false);
            const missing = invalidFlags.filter(f => f.missing === true);

            if (invalid.length) {
                return {
                    success: false,
                    error: RecipleError.fromArray(
                        invalid.map(f => f.error as RecipleError ?? new RecipleError(RecipleError.Code.MessageCommandInvalidFlag(data.command, f.flag)))
                    ),
                    postconditionExecute: {
                        data: {
                            reason: CommandPostconditionReason.InvalidFlags,
                            executeData: data
                        }
                    }
                }
            }

            if (missing.length) {
                return {
                    success: false,
                    error: RecipleError.fromArray(
                        missing.map(f => new RecipleError(RecipleError.Code.MessageCommandMissingRequiredFlag(data.command, f.flag)))
                    ),
                    postconditionExecute: {
                        data: {
                            reason: CommandPostconditionReason.MissingFlags,
                            executeData: data
                        }
                    }
                }
            }
        }

        return true;
    }
}
