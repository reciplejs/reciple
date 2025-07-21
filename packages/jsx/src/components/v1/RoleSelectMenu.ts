import { RoleSelectMenuBuilder, type RoleSelectMenuComponentData } from 'discord.js';
import type { SingleOrArray } from '../../helpers/types.js';

export function RoleSelectMenu(props: RoleSelectMenu.Props) {
    const builder = new RoleSelectMenuBuilder();

    if (props.id !== undefined) builder.setId(props.id);
    if (props.customId !== undefined) builder.setCustomId(props.customId);
    if (props.disabled !== undefined) builder.setDisabled(props.disabled);
    if (props.maxValues !== undefined) builder.setMaxValues(props.maxValues);
    if (props.minValues !== undefined) builder.setMinValues(props.minValues);
    if (props.placeholder !== undefined) builder.setPlaceholder(props.placeholder);
    if (props.defaultValues !== undefined) builder.setDefaultRoles(...props.defaultValues.map(r => r.id));

    if (props.children !== undefined) {
        const options = Array.isArray(props.children) ? props.children : [props.children];
        builder.addDefaultRoles(...options.map(o => o.id));
    }

    return builder;
}

export namespace RoleSelectMenu {
    export interface Props extends Omit<RoleSelectMenuComponentData, 'type'> {
        children?: SingleOrArray<Exclude<RoleSelectMenuComponentData['defaultValues'], undefined>[0]>;
    }
}
