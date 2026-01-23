import { RoleSelectMenuBuilder, type RoleSelectMenuComponentData } from 'discord.js';
import { JSX } from '../../../structures/JSX.js';

export function RoleSelectMenu(props: RoleSelectMenu.Props): RoleSelectMenuBuilder {
    const builder = new RoleSelectMenuBuilder();

    if (props.id !== undefined) builder.setId(props.id);
    if (props.customId !== undefined) builder.setCustomId(props.customId);
    if (props.disabled !== undefined) builder.setDisabled(props.disabled);
    if (props.maxValues !== undefined) builder.setMaxValues(props.maxValues);
    if (props.minValues !== undefined) builder.setMinValues(props.minValues);
    if (props.placeholder !== undefined) builder.setPlaceholder(props.placeholder);
    if (props.defaultValues !== undefined) builder.setDefaultRoles(...props.defaultValues.map(r => r.id));

    if (props.children !== undefined) {
        builder.addDefaultRoles(...JSX.useSingleToArray(props.children).map(o => o.id));
    }

    return builder;
}

export namespace RoleSelectMenu {
    export interface Props extends Omit<RoleSelectMenuComponentData, 'type'> {
        children?: JSX.SingleOrArray<Exclude<RoleSelectMenuComponentData['defaultValues'], undefined>[0]>;
    }
}
