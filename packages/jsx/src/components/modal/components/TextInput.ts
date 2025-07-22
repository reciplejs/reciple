import { TextInputBuilder, type TextInputComponentData } from 'discord.js';
import { JSX } from '../../../structures/JSX.js';

export function TextInput(props: TextInput.Props) {
    const builder = new TextInputBuilder();

    if (props.id !== undefined) builder.setId(props.id);
    if (props.customId !== undefined) builder.setCustomId(props.customId);
    if (props.placeholder !== undefined) builder.setPlaceholder(props.placeholder);
    if (props.style !== undefined) builder.setStyle(props.style);
    if (props.value !== undefined) builder.setValue(props.value);
    if (props.required !== undefined) builder.setRequired(props.required);
    if (props.minLength !== undefined) builder.setMinLength(props.minLength);
    if (props.maxLength !== undefined) builder.setMaxLength(props.maxLength);

    builder.setLabel(JSX.useStringify(props.children, props.label));

    return builder;
}

export namespace TextInput {
    export interface Props extends Omit<Partial<TextInputComponentData>, 'type'> {
        children?: JSX.SingleOrArray<any>;
    }
}
