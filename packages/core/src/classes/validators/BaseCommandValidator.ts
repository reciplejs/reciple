import { CommandType } from '../../helpers/constants.js';
import type { BaseCommand } from '../abstract/BaseCommand.js';
import { CommandPostcondition } from '../structures/CommandPostcondition.js';
import { CommandPrecondition } from '../structures/CommandPrecondition.js';
import { MessageCommandBuilderValidator } from './MessageCommandBuilderValidator.js';
import { Validator } from './Validator.js';

export class BaseCommandValidator extends Validator {
    public static id = BaseCommandValidator.s.string();
    public static type = BaseCommandValidator.s.nativeEnum(CommandType);
    public static data = BaseCommandValidator.s.union([
            MessageCommandBuilderValidator.object,
            Validator.baseApplicationCommand
        ]);

    public static cooldown = BaseCommandValidator.s.number()
        .finite({ message: 'Command cooldowns only accepts finite values' })
        .positive({ message: 'Command cooldowns only accepts positive number' })
        .optional();

    public static preconditions = BaseCommandValidator.s
        .instance(CommandPrecondition)
        .array()
        .optional();

    public static postconditions = BaseCommandValidator.s
        .instance(CommandPostcondition)
        .array()
        .optional();

    public static disabledPreconditions = BaseCommandValidator.s
        .string()
        .array()
        .optional();

    public static disabledPostconditions = BaseCommandValidator.s
        .string()
        .array()
        .optional();

    public static execute = BaseCommandValidator.s.instance(Function);

    public static object = BaseCommandValidator.s
        .object({
            id: BaseCommandValidator.id,
            type: BaseCommandValidator.type,
            data: BaseCommandValidator.data,
            cooldown: BaseCommandValidator.cooldown,
            preconditions: BaseCommandValidator.preconditions,
            postconditions: BaseCommandValidator.postconditions,
            disabledPreconditions: BaseCommandValidator.disabledPreconditions,
            disabledPostconditions: BaseCommandValidator.disabledPostconditions,
            execute: BaseCommandValidator.execute,
        });

    public static resolvable = BaseCommandValidator.s.union([BaseCommandValidator.object, BaseCommandValidator.jsonEncodable]);

    public static isValidId(value: unknown): asserts value is string {
        BaseCommandValidator.id.setValidationEnabled(BaseCommandValidator.isValidationEnabled).parse(value);
    }

    public static isValidType(value: unknown): asserts value is CommandType {
        BaseCommandValidator.type.setValidationEnabled(BaseCommandValidator.isValidationEnabled).parse(value);
    }

    public static isValidData(value: unknown): asserts value is BaseCommand.Data<CommandType>['data'] {
        BaseCommandValidator.data.setValidationEnabled(BaseCommandValidator.isValidationEnabled).parse(value);
    }

    public static isValidCooldown(value: unknown): asserts value is BaseCommand.Data<CommandType>['cooldown'] {
        BaseCommandValidator.cooldown.setValidationEnabled(BaseCommandValidator.isValidationEnabled).parse(value);
    }

    public static isValidPreconditions(value: unknown): asserts value is BaseCommand.Data<CommandType>['preconditions'] {
        BaseCommandValidator.preconditions.setValidationEnabled(BaseCommandValidator.isValidationEnabled).parse(value);
    }

    public static isValidPostconditions(value: unknown): asserts value is BaseCommand.Data<CommandType>['postconditions'] {
        BaseCommandValidator.postconditions.setValidationEnabled(BaseCommandValidator.isValidationEnabled).parse(value);
    }

    public static isValidDisabledPreconditions(value: unknown): asserts value is BaseCommand.Data<CommandType>['disabledPreconditions'] {
        BaseCommandValidator.disabledPreconditions.setValidationEnabled(BaseCommandValidator.isValidationEnabled).parse(value);
    }

    public static isValidDisabledPostconditions(value: unknown): asserts value is BaseCommand.Data<CommandType>['disabledPostconditions'] {
        BaseCommandValidator.disabledPostconditions.setValidationEnabled(BaseCommandValidator.isValidationEnabled).parse(value);
    }

    public static isValidExecute(value: unknown): asserts value is BaseCommand.Data<CommandType>['execute'] {
        BaseCommandValidator.execute.setValidationEnabled(BaseCommandValidator.isValidationEnabled).parse(value);
    }

    public static isValid(value: unknown): asserts value is BaseCommand.Data<CommandType> {
        const data = value as BaseCommand.Data<CommandType>;

        BaseCommandValidator.isValidId(data.id);
        BaseCommandValidator.isValidType(data.type);
        BaseCommandValidator.isValidData(data.data);
        BaseCommandValidator.isValidCooldown(data.cooldown);
        BaseCommandValidator.isValidPreconditions(data.preconditions);
        BaseCommandValidator.isValidPostconditions(data.postconditions);
        BaseCommandValidator.isValidDisabledPreconditions(data.disabledPreconditions);
        BaseCommandValidator.isValidDisabledPostconditions(data.disabledPostconditions);
        BaseCommandValidator.isValidExecute(data.execute);
    }
}
