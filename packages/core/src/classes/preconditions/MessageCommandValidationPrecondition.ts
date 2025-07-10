import { CommandPostconditionReason, CommandType } from '../../helpers/constants.js';
import type { AnyCommandExecuteData } from '../../helpers/types.js';
import { BaseCommandPrecondition } from '../abstract/BaseCommandPrecondition.js';
import { RecipleError } from '../structures/RecipleError.js';

export class MessageCommandValidationPrecondition extends BaseCommandPrecondition {
    public scope = [CommandType.Message];

    public async execute<T extends CommandType>(data: AnyCommandExecuteData<T>): Promise<BaseCommandPrecondition.ResultDataResolvable<T, any>> {
        if (data.type !== CommandType.Message) return true;

        const invalidOptions = await data.options.getInvalidOptions();
        const invalidFlags = await data.flags.getInvalidFlags();

        if (invalidOptions.length) {
            const invalid = invalidOptions.filter(o => o.missing === false);
            const missing = invalidOptions.filter(o => o.missing === true);

            if (invalid.length) {
                return {
                    success: false,
                    error: new RecipleError(RecipleError.Code.MultipleErrors(
                        invalid.map(o => new RecipleError(RecipleError.Code.MessageCommandInvalidOption(data.command, o.option)))
                    )),
                    postconditionData: {
                        reason: CommandPostconditionReason.InvalidArgs,
                        executeData: data
                    }
                }
            }

            if (missing.length) {
                return {
                    success: false,
                    error: new RecipleError(RecipleError.Code.MultipleErrors(
                        missing.map(o => new RecipleError(RecipleError.Code.MessageCommandMissingRequiredOption(data.command, o.option)))
                    )),
                    postconditionData: {
                        reason: CommandPostconditionReason.MissingArgs,
                        executeData: data
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
                    error: new RecipleError(RecipleError.Code.MultipleErrors(
                        invalid.map(f => new RecipleError(RecipleError.Code.MessageCommandInvalidFlag(data.command, f.flag)))
                    )),
                    postconditionData: {
                        reason: CommandPostconditionReason.InvalidFlags,
                        executeData: data
                    }
                }
            }

            if (missing.length) {
                return {
                    success: false,
                    error: new RecipleError(RecipleError.Code.MultipleErrors(
                        missing.map(f => new RecipleError(RecipleError.Code.MessageCommandMissingRequiredFlag(data.command, f.flag)))
                    )),
                    postconditionData: {
                        reason: CommandPostconditionReason.MissingFlags,
                        executeData: data
                    }
                }
            }
        }

        return true;
    }
}
