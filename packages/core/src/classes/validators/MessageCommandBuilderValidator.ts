import type { MessageCommandBuilder } from '../builders/MessageCommandBuilder.js';
import type { MessageCommandFlag } from '../structures/MessageCommandFlag.js';
import type { MessageCommandOption } from '../structures/MessageCommandOption.js';
import { MessageCommandFlagValidator } from './MessageCommandFlagValidator.js';
import { MessageCommandOptionValidator } from './MessageCommandOptionValidator.js';
import { Validator } from './Validator.js';

export class MessageCommandBuilderValidator extends Validator {
    public static name = MessageCommandBuilderValidator.s
        .string({ message: 'Expected string as message command name' })
        .lengthGreaterThanOrEqual(1, { message: 'Message command name needs to have at least single character' })
        .lengthLessThanOrEqual(32, { message: 'Message command name cannot exceed 32 characters' })
        .regex(MessageCommandBuilderValidator.nameRegex, { message: 'Message command name can only be alphanumeric without spaces' });

    public static description = MessageCommandBuilderValidator.s
        .string({ message: 'Expected string as message command description' })
        .lengthGreaterThanOrEqual(1, { message: 'Message command description needs to have at least single character' })
        .lengthLessThanOrEqual(100, { message: 'Message command description cannot exceed 100 characters' });

    public static aliases = MessageCommandBuilderValidator.name
        .array({ message: 'Aliases are array of strings' })
        .optional();

    public static options = MessageCommandOptionValidator.object
        .array()
        .optional();

    public static flags = MessageCommandFlagValidator.object
        .array()
        .optional();

    public static object = MessageCommandBuilderValidator.s
        .object({
            name: MessageCommandBuilderValidator.name,
            description: MessageCommandBuilderValidator.description,
            aliases: MessageCommandBuilderValidator.aliases,
            options: MessageCommandBuilderValidator.options,
            flags: MessageCommandBuilderValidator.flags,
        });

    public static resolvable = MessageCommandBuilderValidator.s.union([MessageCommandBuilderValidator.object, MessageCommandBuilderValidator.jsonEncodable]);

    public static isValidName(name: unknown): asserts name is string {
        MessageCommandBuilderValidator.name.setValidationEnabled(MessageCommandBuilderValidator.isValidationEnabled).parse(name);
    }

    public static isValidDescription(description: unknown): asserts description is string {
        MessageCommandBuilderValidator.description.setValidationEnabled(MessageCommandBuilderValidator.isValidationEnabled).parse(description);
    }

    public static isValidAliases(aliases: unknown): asserts aliases is string[] {
        MessageCommandBuilderValidator.aliases.setValidationEnabled(MessageCommandBuilderValidator.isValidationEnabled).parse(aliases);
    }

    public static isValidOptions(options: unknown): asserts options is MessageCommandOption.Data[] {
        MessageCommandBuilderValidator.options.setValidationEnabled(MessageCommandBuilderValidator.isValidationEnabled).parse(options);
    }

    public static isValidFlags(flags: unknown): asserts flags is MessageCommandFlag.Data[] {
        MessageCommandBuilderValidator.flags.setValidationEnabled(MessageCommandBuilderValidator.isValidationEnabled).parse(flags);
    }

    public static isValid(value: unknown): asserts value is MessageCommandBuilder.Data {
        const data = value as MessageCommandBuilder.Data;

        MessageCommandBuilderValidator.name.setValidationEnabled(MessageCommandBuilderValidator.isValidationEnabled).parse(data.name);
        MessageCommandBuilderValidator.description.setValidationEnabled(MessageCommandBuilderValidator.isValidationEnabled).parse(data.description);
        MessageCommandBuilderValidator.aliases.setValidationEnabled(MessageCommandBuilderValidator.isValidationEnabled).parse(data.aliases);

        if ('options' in data && Array.isArray(data.options)) {
            for (const option of data.options) {
                MessageCommandOptionValidator.isValid(option);
            }
        } else {
            MessageCommandBuilderValidator.isValidOptions(data.options);
        }

        if ('flags' in data && Array.isArray(data.flags)) {
            for (const flag of data.flags) {
                MessageCommandFlagValidator.isValid(flag);
            }
        } else {
            MessageCommandBuilderValidator.isValidFlags(data.flags);
        }
    }
}
