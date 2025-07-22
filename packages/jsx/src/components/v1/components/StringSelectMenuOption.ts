import { StringSelectMenuOptionBuilder, type SelectMenuComponentOptionData } from 'discord.js';
import { JSX } from '../../../jsx-runtime.js';

export function StringSelectMenuOption(props: StringSelectMenuOption.Props): StringSelectMenuOptionBuilder {
    const builder = new StringSelectMenuOptionBuilder();

    if (props.label !== undefined) builder.setLabel(props.label);
    if (props.value !== undefined) builder.setValue(props.value);
    if (props.description !== undefined) builder.setDescription(props.description);
    if (props.emoji !== undefined) builder.setEmoji(props.emoji);
    if (props.default !== undefined) builder.setDefault(props.default);

    if (props.children !== undefined) builder.setDescription(JSX.useStringify(props.children, props.description));

    return builder;
}

export namespace StringSelectMenuOption {
    export interface Props extends SelectMenuComponentOptionData {
        children?: JSX.SingleOrArray<any>;
    }
}
