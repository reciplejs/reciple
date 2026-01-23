import { CommandPostconditionReason, CommandType } from '../../helpers/constants.js';
import type { AnyCommandExecuteData } from '../../helpers/types.js';
import { CommandPrecondition } from '../structures/CommandPrecondition.js';
import { RecipleError } from '../structures/RecipleError.js';

export class MessageCommandOptionValidatePrecondition extends CommandPrecondition {
    public scope = [CommandType.Message];

    constructor(public readonly options?: MessageCommandOptionValidatePrecondition.Options) {
        super();
    }

    public async execute<T extends CommandType>(data: AnyCommandExecuteData<T>): Promise<CommandPrecondition.ResultDataResolvable<T, any>> {
        if (data.type !== CommandType.Message) return true;

        const invalidOptions = await data.options.getInvalidOptions();

        if (invalidOptions.length) {
            const invalid = invalidOptions.filter(o => o.missing === false);
            const missing = invalidOptions.filter(o => o.missing === true);

            if (invalid.length) {
                return {
                    success: false,
                    error: this.options?.thowOnInvalid
                        ? RecipleError.fromArray(invalid
                            .map(o => o.error as RecipleError
                                ?? new RecipleError(RecipleError.Code.MessageCommandInvalidOption(data.command, o.option))
                            )
                        )
                        : undefined,
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
                    error: this.options?.throwOnMissing
                        ? RecipleError.fromArray(
                            missing.map(o => new RecipleError(RecipleError.Code.MessageCommandMissingRequiredOption(data.command, o.option)))
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

export namespace MessageCommandOptionValidatePrecondition {
    export interface Options {
        thowOnInvalid?: boolean;
        throwOnMissing?: boolean;
    }
}
