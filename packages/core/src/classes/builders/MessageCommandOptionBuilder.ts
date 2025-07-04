import { MessageCommandOption } from '../structures/MessageCommandOption.js';

export class MessageCommandOptionBuilder<T> extends MessageCommandOption<T> {
    public setName(name: string): this {
        this.name = name;
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

    public setValidate(validate: MessageCommandOption.Data<T>['validate']): this {
        this.validate = validate;
        return this;
    }

    public setResolve(resolve: MessageCommandOption.Data<T>['resolve']): this {
        this.resolve = resolve;
        return this;
    }
}
