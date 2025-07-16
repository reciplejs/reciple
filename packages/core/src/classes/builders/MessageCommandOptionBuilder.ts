import { MessageCommandOption } from '../structures/MessageCommandOption.js';
import { MessageCommandOptionValidator } from '../validators/MessageCommandOptionValidator.js';

export class MessageCommandOptionBuilder<T> extends MessageCommandOption<T> {
    constructor(data?: Partial<MessageCommandOption.Data<T>>) {
        MessageCommandOptionValidator.object
            .partial()
            .optional()
            .setValidationEnabled(MessageCommandOptionValidator.isValidationEnabled)
            .parse(data);

        super(data);
    }

    public setName(name: string): this {
        MessageCommandOptionValidator.isValidName(name);
        this.name = name;
        return this;
    }

    public setDescription(description: string): this {
        MessageCommandOptionValidator.isValidDescription(description);
        this.description = description;
        return this;
    }

    public setRequired(required: boolean): this {
        MessageCommandOptionValidator.isValidRequired(required);
        this.required = required;
        return this;
    }

    public setValidate(validate: MessageCommandOption.Data<T>['validate']): this {
        MessageCommandOptionValidator.isValidValidate(validate);
        this.validate = validate;
        return this;
    }

    public setResolve(resolve: MessageCommandOption.Data<T>['resolve']): this {
        MessageCommandOptionValidator.isValidResolve(resolve);
        this.resolve = resolve;
        return this;
    }
}
