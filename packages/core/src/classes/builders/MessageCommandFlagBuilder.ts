import { normalizeArray, type RestOrArray } from 'discord.js';
import { MessageCommandFlag } from '../structures/MessageCommandFlag.js';

export class MessageCommandFlagBuilder<T> extends MessageCommandFlag<T> {
    public setName(name: string): this {
        this.name = name;
        return this;
    }

    public setShortcut(shortcut: string): this {
        this.shortcut = shortcut;
        return this;
    }

    public setDescription(description: string): this {
        this.description = description;
        return this;
    }

    public setRequired(required: boolean): this {
        this.required = required;
        return this;
    }

    public setMultiple(multiple: boolean): this {
        this.multiple = multiple;
        return this;
    }

    public setDefaultValues(...default_values: RestOrArray<string|boolean>): this {
        this.default_values = normalizeArray(default_values) as string[]|boolean[];
        return this;
    }

    public setValueType(value_type: MessageCommandFlag.Data<T>['value_type']): this {
        this.value_type = value_type;
        return this;
    }

    public setValidate(validate: MessageCommandFlag.Data<T>['validate']): this {
        this.validate = validate;
        return this;
    }

    public setResolve(resolve: MessageCommandFlag.Data<T>['resolve']): this {
        this.resolve = resolve;
        return this;
    }
}
