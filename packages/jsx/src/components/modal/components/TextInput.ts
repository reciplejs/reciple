import { TextInputBuilder, type TextInputComponentData } from 'discord.js';
import type { SingleOrArray } from '../../../helpers/types.js';

export function TextInput(props: TextInput.Props) {
    const builder = new TextInputBuilder();

    if (props.id !== undefined) builder.setId(props.id);
    if (props.customId !== undefined) builder.setCustomId(props.customId);
    if (props.label !== undefined) builder.setLabel(props.label);
    if (props.placeholder !== undefined) builder.setPlaceholder(props.placeholder);
    if (props.style !== undefined) builder.setStyle(props.style);
    if (props.value !== undefined) builder.setValue(props.value);
    if (props.required !== undefined) builder.setRequired(props.required);
    if (props.minLength !== undefined) builder.setMinLength(props.minLength);
    if (props.maxLength !== undefined) builder.setMaxLength(props.maxLength);

    if (props.children !== undefined) builder.setLabel(
        Array.isArray(props.children)
            ? props.children.join(' ')
            : String(props.children)
    );

    return builder;
}

export namespace TextInput {
    export interface Props extends Omit<Partial<TextInputComponentData>, 'type'> {
        children?: SingleOrArray<any>;
    }
}
