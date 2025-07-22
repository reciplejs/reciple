import { isJSONEncodable, StringSelectMenuBuilder, type APISelectMenuOption, type Awaitable, type JSONEncodable, type StringSelectMenuComponentData, type StringSelectMenuInteraction } from 'discord.js';
import { JSX } from '../../../structures/JSX.js';

export function StringSelectMenu(props: StringSelectMenu.Props): StringSelectMenuBuilder {
    const builder = new StringSelectMenuBuilder();

    if (props.id !== undefined) builder.setId(props.id);
    if (props.customId !== undefined) builder.setCustomId(props.customId);
    if (props.disabled !== undefined) builder.setDisabled(props.disabled);
    if (props.maxValues !== undefined) builder.setMaxValues(props.maxValues);
    if (props.minValues !== undefined) builder.setMinValues(props.minValues);
    if (props.placeholder !== undefined) builder.setPlaceholder(props.placeholder);

    if (props.children !== undefined) {
        builder.addOptions(JSX.useSingleToArray(props.children).map(o => isJSONEncodable(o) ? o.toJSON() : o));
    }

    return builder;
}

export namespace StringSelectMenu {
    export interface Props extends Omit<StringSelectMenuComponentData, 'type'|'options'> {
        children?: JSX.SingleOrArray<
            Exclude<StringSelectMenuComponentData['options'], undefined>[0]
            |JSONEncodable<APISelectMenuOption>
        >;
        // TODO: Implement action for prop `onSelect`
        onSelect?: (interaction: StringSelectMenuInteraction) => Awaitable<void>;
    }
}
