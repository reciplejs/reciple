import { MessageCommandFlag } from '../structures/MessageCommandFlag.js';
import { Validator } from './Validator.js';

export class MessageCommandFlagValidator extends Validator {
    public static name = MessageCommandFlagValidator.s
        .string({ message: 'Expected string as message command flag name' })
        .lengthGreaterThanOrEqual(1, { message: 'Message command flag name needs to have at least single character' })
        .lengthLessThanOrEqual(32, { message: 'Message command flag name cannot exceed 32 characters' })
        .regex(MessageCommandFlagValidator.nameRegex, { message: 'Message command flag name can only be alphanumeric without spaces' });

    public static shortcut = MessageCommandFlagValidator.s
        .string({ message: 'Expected string as message command flag shortcut' })
        .lengthGreaterThanOrEqual(1, { message: 'Message command flag shortcut needs to be a single character' })
        .lengthLessThanOrEqual(1, { message: 'Message command flag shortcut cannot have more than a single character' })
        .regex(MessageCommandFlagValidator.nameRegex, { message: 'Message command flag shortcut can only be lowercase alphanumeric' });

    public static description = MessageCommandFlagValidator.s
        .string({ message: 'Expected string as message command flag description' })
        .lengthGreaterThanOrEqual(1, { message: 'Message command flag description needs to have at least single character' })
        .lengthLessThanOrEqual(100, { message: 'Message command flag description cannot exceed 100 characters' });

    public static required = MessageCommandFlagValidator.s
        .boolean({ message: 'Expected boolean for .required' })
        .optional();

    public static multiple = MessageCommandFlagValidator.s
        .boolean({ message: 'Expected boolean for .multiple' })
        .optional();

    public static defaultValues = MessageCommandFlagValidator.s.string().array()
        .or(MessageCommandFlagValidator.s.boolean().array())
        .optional();

    public static valueType = MessageCommandFlagValidator.s.union([
            MessageCommandFlagValidator.s.literal('string'),
            MessageCommandFlagValidator.s.literal('boolean')
        ])
        .optional();

    public static validate = MessageCommandFlagValidator.s
        .instance(Function, { message: 'Expected a function for .validate' })
        .optional();

    public static resolve = MessageCommandFlagValidator.s
        .instance(Function, { message: 'Expected a function for .resolve' })
        .optional();

    public static object = MessageCommandFlagValidator.s
        .object({
            name: MessageCommandFlagValidator.name,
            shortcut: MessageCommandFlagValidator.shortcut,
            description: MessageCommandFlagValidator.description,
            required: MessageCommandFlagValidator.required,
            multiple: MessageCommandFlagValidator.multiple,
            validate: MessageCommandFlagValidator.validate,
            resolve: MessageCommandFlagValidator.resolve,
            defaultValues: MessageCommandFlagValidator.defaultValues,
            valueType: MessageCommandFlagValidator.valueType
        });

    public static resolvable = MessageCommandFlagValidator.s.union([MessageCommandFlagValidator.object, MessageCommandFlagValidator.jsonEncodable]);

    public static isValidName(name: unknown): asserts name is string {
        MessageCommandFlagValidator.name.setValidationEnabled(MessageCommandFlagValidator.isValidationEnabled).parse(name);
    }

    public static isValidShortcut(shortcut: unknown): asserts shortcut is string {
        MessageCommandFlagValidator.shortcut.setValidationEnabled(MessageCommandFlagValidator.isValidationEnabled).parse(shortcut);
    }

    public static isValidDescription(description: unknown): asserts description is string {
        MessageCommandFlagValidator.description.setValidationEnabled(MessageCommandFlagValidator.isValidationEnabled).parse(description);
    }

    public static isValidRequired(required: unknown): asserts required is boolean {
        MessageCommandFlagValidator.required.setValidationEnabled(MessageCommandFlagValidator.isValidationEnabled).parse(required);
    }

    public static isValidMultiple(multiple: unknown): asserts multiple is boolean {
        MessageCommandFlagValidator.multiple.setValidationEnabled(MessageCommandFlagValidator.isValidationEnabled).parse(multiple);
    }

    public static isValidDefaultValues(defaultValues: unknown): asserts defaultValues is string[] | boolean[] {
        MessageCommandFlagValidator.defaultValues.setValidationEnabled(MessageCommandFlagValidator.isValidationEnabled).parse(defaultValues);
    }

    public static isValidValueType(valueType: unknown): asserts valueType is string | boolean {
        MessageCommandFlagValidator.valueType.setValidationEnabled(MessageCommandFlagValidator.isValidationEnabled).parse(valueType);
    }

    public static isValidValidate(validate: unknown): asserts validate is Function {
        MessageCommandFlagValidator.validate.setValidationEnabled(MessageCommandFlagValidator.isValidationEnabled).parse(validate);
    }

    public static isValidResolve(resolve: unknown): asserts resolve is Function {
        MessageCommandFlagValidator.resolve.setValidationEnabled(MessageCommandFlagValidator.isValidationEnabled).parse(resolve);
    }

    public static isValid(value: unknown): asserts value is MessageCommandFlag.Data {
        const data = value as MessageCommandFlag.Data;

        MessageCommandFlagValidator.isValidName(data.name);
        MessageCommandFlagValidator.isValidShortcut(data.shortcut);
        MessageCommandFlagValidator.isValidDescription(data.description);
        MessageCommandFlagValidator.isValidRequired(data.required);
        MessageCommandFlagValidator.isValidMultiple(data.multiple);
        MessageCommandFlagValidator.isValidDefaultValues(data.defaultValues);
        MessageCommandFlagValidator.isValidValueType(data.valueType);
        MessageCommandFlagValidator.isValidValidate(data.validate);
        MessageCommandFlagValidator.isValidResolve(data.resolve);
    }
}
