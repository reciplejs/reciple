import { normalizeArray, type RestOrArray } from 'discord.js';
import { MessageCommandFlag } from '../structures/MessageCommandFlag.js';
import { MessageCommandFlagValidator } from '../validators/MessageCommandFlagValidator.js';

export class MessageCommandFlagBuilder<T> extends MessageCommandFlag<T> {
    constructor(data?: Partial<MessageCommandFlag.Data<T>>) {
        MessageCommandFlagValidator.object
            .partial()
            .optional()
            .setValidationEnabled(MessageCommandFlagValidator.isValidationEnabled)
            .parse(data);

        super(data);
    }

    public setName(name: string): this {
        MessageCommandFlagValidator.isValidName(name);
        this.name = name;
        return this;
    }

    public setShortcut(shortcut: string): this {
        MessageCommandFlagValidator.isValidShortcut(shortcut);
        this.shortcut = shortcut;
        return this;
    }

    public setDescription(description: string): this {
        MessageCommandFlagValidator.isValidDescription(description);
        this.description = description;
        return this;
    }

    public setRequired(required: boolean): this {
        MessageCommandFlagValidator.isValidRequired(required);
        this.required = required;
        return this;
    }

    public setMultiple(multiple: boolean): this {
        MessageCommandFlagValidator.isValidMultiple(multiple);
        this.multiple = multiple;
        return this;
    }

    public setDefaultValues(...defaultValues: RestOrArray<string|boolean>): this {
        const values = normalizeArray(defaultValues);

        MessageCommandFlagValidator.isValidDefaultValues(values);
        this.defaultValues = values;
        return this;
    }

    public setValueType(valueType: MessageCommandFlag.Data<T>['valueType']): this {
        MessageCommandFlagValidator.isValidValueType(valueType);
        this.valueType = valueType;
        return this;
    }

    public setValidate(validate: MessageCommandFlag.Data<T>['validate']): this {
        MessageCommandFlagValidator.isValidValidate(validate);
        this.validate = validate;
        return this;
    }

    public setResolve(resolve: MessageCommandFlag.Data<T>['resolve']): this {
        MessageCommandFlagValidator.isValidResolve(resolve);
        this.resolve = resolve;
        return this;
    }
}
