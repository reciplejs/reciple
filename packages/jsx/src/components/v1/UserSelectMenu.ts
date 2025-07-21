import { UserSelectMenuBuilder, type UserSelectMenuComponentData } from 'discord.js';
import type { SingleOrArray } from '../../helpers/types.js';

export function UserSelectMenu(props: StringSelectMenu.Props) {
    const builder = new UserSelectMenuBuilder();

    if (props.id !== undefined) builder.setId(props.id);
    if (props.customId !== undefined) builder.setCustomId(props.customId);
    if (props.disabled !== undefined) builder.setDisabled(props.disabled);
    if (props.maxValues !== undefined) builder.setMaxValues(props.maxValues);
    if (props.minValues !== undefined) builder.setMinValues(props.minValues);
    if (props.placeholder !== undefined) builder.setPlaceholder(props.placeholder);
    if (props.defaultValues !== undefined) builder.setDefaultUsers(...props.defaultValues.map(c => c.id));

    if (props.children !== undefined) {
        const options = Array.isArray(props.children) ? props.children : [props.children];
        builder.addDefaultUsers(...options.map(o => o.id));
    }

    return builder;
}

export namespace StringSelectMenu {
    export interface Props extends Omit<UserSelectMenuComponentData, 'type'> {
        children?: SingleOrArray<Exclude<UserSelectMenuComponentData['defaultValues'], undefined>[0]>;
    }
}
