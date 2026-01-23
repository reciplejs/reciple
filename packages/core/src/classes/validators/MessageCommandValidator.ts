import type { Constructable } from 'discord.js';
import { BaseCommandValidator } from './BaseCommandValidator.js';
import { CommandType } from '../../helpers/constants.js';
import { MessageCommandBuilderValidator } from './MessageCommandBuilderValidator.js';
import type { MessageCommand } from '../commands/MessageCommand.js';

const Base: Constructable<Omit<BaseCommandValidator, 'type'|'data'>> = BaseCommandValidator;

export class MessageCommandValidator extends Base {
    public static type = BaseCommandValidator.s.literal(CommandType.Message);
    public static data = MessageCommandBuilderValidator.object;

    public static isValidType(value: unknown): asserts value is CommandType.Message {
        BaseCommandValidator.type.setValidationEnabled(BaseCommandValidator.isValidationEnabled).parse(value);
    }

    public static isValidData(value: unknown): asserts value is MessageCommand.Data {
        BaseCommandValidator.data.setValidationEnabled(BaseCommandValidator.isValidationEnabled).parse(value);
    }

    public static isValid(value: unknown): asserts value is MessageCommand {
        const data = value as MessageCommand.Data;

        MessageCommandValidator.isValidType(data.type);
        MessageCommandBuilderValidator.isValid(data.data);

        BaseCommandValidator.isValidId(data.id);
        BaseCommandValidator.isValidCooldown(data.cooldown);
        BaseCommandValidator.isValidPreconditions(data.preconditions);
        BaseCommandValidator.isValidPostconditions(data.postconditions);
        BaseCommandValidator.isValidDisabledPreconditions(data.disabledPreconditions);
        BaseCommandValidator.isValidDisabledPostconditions(data.disabledPostconditions);
        BaseCommandValidator.isValidExecute(data.execute);
    }
}
