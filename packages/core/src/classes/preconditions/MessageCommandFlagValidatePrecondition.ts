import { CommandPostconditionReason, CommandType } from '../../helpers/constants.js';
import type { AnyCommandExecuteData } from '../../helpers/types.js';
import { CommandPrecondition } from '../structures/CommandPrecondition.js';
import { RecipleError } from '../structures/RecipleError.js';

export class MessageCommandFlagValidatePrecondition extends CommandPrecondition {
    public scope = [CommandType.Message];

    constructor(public readonly options?: MessageCommandFlagValidatePrecondition.Options) {
        super();
    }

    public async execute<T extends CommandType>(data: AnyCommandExecuteData<T>): Promise<CommandPrecondition.ResultDataResolvable<T, any>> {
        if (data.type !== CommandType.Message) return true;

        const invalidFlags = await data.flags.getInvalidFlags();

        if (invalidFlags.length) {
            const invalid = invalidFlags.filter(o => o.missing === false);
            const missing = invalidFlags.filter(o => o.missing === true);

            if (invalid.length) {
                return {
                    success: false,
                    error: this.options?.thowOnInvalid
                        ? RecipleError.fromArray(invalid
                            .map(o => o.error as RecipleError
                                ?? new RecipleError(RecipleError.Code.MessageCommandInvalidFlag(data.command, o.flag))
                            )
                        )
                        : undefined,
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
                    error: this.options?.throwOnMissing
                        ? RecipleError.fromArray(missing
                            .map(o => new RecipleError(RecipleError.Code.MessageCommandMissingRequiredFlag(data.command, o.flag)))
                        )
                        : undefined,
                    postconditionExecute: {
                        data: {
                            reason: CommandPostconditionReason.MissingArgs,
                            executeData: data
                        }
                    }
                }
            }
        }

        return true;
    }
}

export namespace MessageCommandFlagValidatePrecondition {
    export interface Options {
        thowOnInvalid?: boolean;
        throwOnMissing?: boolean;
    }
}
