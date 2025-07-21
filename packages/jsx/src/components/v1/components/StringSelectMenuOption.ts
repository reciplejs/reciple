import { StringSelectMenuOptionBuilder, type SelectMenuComponentOptionData } from 'discord.js';
import type { SingleOrArray } from '../../../helpers/types.js';

export function StringSelectMenuOption(props: StringSelectMenuOption.Props): StringSelectMenuOptionBuilder {
    const builder = new StringSelectMenuOptionBuilder();

    if (props.label !== undefined) builder.setLabel(props.label);
    if (props.value !== undefined) builder.setValue(props.value);
    if (props.description !== undefined) builder.setDescription(props.description);
    if (props.emoji !== undefined) builder.setEmoji(props.emoji);
    if (props.default !== undefined) builder.setDefault(props.default);

    if (props.children !== undefined) builder.setDescription(
        Array.isArray(props.children)
            ? props.children.join(' ')
            : String(props.children)
    );

    return builder;
}

export namespace StringSelectMenuOption {
    export interface Props extends SelectMenuComponentOptionData {
        children?: SingleOrArray<any>;
    }
}
