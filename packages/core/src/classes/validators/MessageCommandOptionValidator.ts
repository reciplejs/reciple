import type { MessageCommandOption } from '../structures/MessageCommandOption.js';
import { Validator } from './Validator.js';

export class MessageCommandOptionValidator extends Validator {
    public static name = MessageCommandOptionValidator.s
        .string({ message: 'Expected string as message command option name' })
        .lengthGreaterThanOrEqual(1, { message: 'Message command option name needs to have at least single character' })
        .lengthLessThanOrEqual(32, { message: 'Message command option name cannot exceed 32 characters' })
        .regex(MessageCommandOptionValidator.nameRegex, { message: 'Message command option name can only be alphanumeric without spaces' });

    public static description = MessageCommandOptionValidator.s
        .string({ message: 'Expected string as message command option description' })
        .lengthGreaterThanOrEqual(1, { message: 'Message command option description needs to have at least single character' })
        .lengthLessThanOrEqual(100, { message: 'Message command option description cannot exceed 100 characters' });

    public static required = MessageCommandOptionValidator.s
        .boolean({ message: 'Expected boolean for .required' })
        .optional();


    public static validate = MessageCommandOptionValidator.s
        .instance(Function, { message: 'Expected a function for .validate' })
        .optional();

    public static resolve = MessageCommandOptionValidator.s
        .instance(Function, { message: 'Expected a function for .resolve' })
        .optional();

    public static object = MessageCommandOptionValidator.s
        .object({
            name: MessageCommandOptionValidator.name,
            description: MessageCommandOptionValidator.description,
            required: MessageCommandOptionValidator.required,
            validate: MessageCommandOptionValidator.validate,
            resolve: MessageCommandOptionValidator.resolve,
        });

    public static resolvable = MessageCommandOptionValidator.s.union([MessageCommandOptionValidator.object, MessageCommandOptionValidator.jsonEncodable]);

    public static isValidName(name: unknown): asserts name is string {
        MessageCommandOptionValidator.name.setValidationEnabled(MessageCommandOptionValidator.isValidationEnabled).parse(name);
    }

    public static isValidDescription(description: unknown): asserts description is string {
        MessageCommandOptionValidator.description.setValidationEnabled(MessageCommandOptionValidator.isValidationEnabled).parse(description);
    }

    public static isValidRequired(required: unknown): asserts required is boolean {
        MessageCommandOptionValidator.required.setValidationEnabled(MessageCommandOptionValidator.isValidationEnabled).parse(required);
    }

    public static isValidValidate(validate: unknown): asserts validate is Function {
        MessageCommandOptionValidator.validate.setValidationEnabled(MessageCommandOptionValidator.isValidationEnabled).parse(validate);
    }

    public static isValidResolve(resolve: unknown): asserts resolve is Function {
        MessageCommandOptionValidator.resolve.setValidationEnabled(MessageCommandOptionValidator.isValidationEnabled).parse(resolve);
    }

    public static isValid(value: unknown): asserts value is MessageCommandOption.Data {
        const data = value as MessageCommandOption.Data;

        MessageCommandOptionValidator.isValidName(data.name);
        MessageCommandOptionValidator.isValidDescription(data.description);
        MessageCommandOptionValidator.isValidRequired(data.required);
        MessageCommandOptionValidator.isValidValidate(data.validate);
        MessageCommandOptionValidator.isValidResolve(data.resolve);
    }
}
