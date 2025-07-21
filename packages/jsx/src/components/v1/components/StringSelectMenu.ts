import { isJSONEncodable, StringSelectMenuBuilder, type APISelectMenuOption, type JSONEncodable, type StringSelectMenuComponentData } from 'discord.js';
import type { SingleOrArray } from '../../../helpers/types.js';

export function StringSelectMenu(props: StringSelectMenu.Props) {
    const builder = new StringSelectMenuBuilder();

    if (props.id !== undefined) builder.setId(props.id);
    if (props.customId !== undefined) builder.setCustomId(props.customId);
    if (props.disabled !== undefined) builder.setDisabled(props.disabled);
    if (props.maxValues !== undefined) builder.setMaxValues(props.maxValues);
    if (props.minValues !== undefined) builder.setMinValues(props.minValues);
    if (props.placeholder !== undefined) builder.setPlaceholder(props.placeholder);
    if (props.options !== undefined) builder.setOptions(...props.options);

    if (props.children !== undefined) {
        const options = Array.isArray(props.children) ? props.children : [props.children];
        builder.addOptions(options.map(o => isJSONEncodable(o) ? o.toJSON() : o));
    }

    return builder;
}

export namespace StringSelectMenu {
    export interface Props extends Omit<StringSelectMenuComponentData, 'type'|'options'> {
        options?: StringSelectMenuComponentData['options'];
        children?: SingleOrArray<
            Exclude<StringSelectMenuComponentData['options'], undefined>[0]
            |JSONEncodable<APISelectMenuOption>
        >;
    }
}
