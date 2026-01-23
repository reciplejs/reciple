import { UserSelectMenuBuilder, type UserSelectMenuComponentData } from 'discord.js';
import { JSX } from '../../../structures/JSX.js';

export function UserSelectMenu(props: UserSelectMenu.Props): UserSelectMenuBuilder {
    const builder = new UserSelectMenuBuilder();

    if (props.id !== undefined) builder.setId(props.id);
    if (props.customId !== undefined) builder.setCustomId(props.customId);
    if (props.disabled !== undefined) builder.setDisabled(props.disabled);
    if (props.maxValues !== undefined) builder.setMaxValues(props.maxValues);
    if (props.minValues !== undefined) builder.setMinValues(props.minValues);
    if (props.placeholder !== undefined) builder.setPlaceholder(props.placeholder);
    if (props.defaultValues !== undefined) builder.setDefaultUsers(...props.defaultValues.map(c => c.id));

    if (props.children !== undefined) {
        builder.addDefaultUsers(...JSX.useSingleToArray(props.children).map(o => o.id));
    }

    return builder;
}

export namespace UserSelectMenu {
    export interface Props extends Omit<UserSelectMenuComponentData, 'type'> {
        children?: JSX.SingleOrArray<Exclude<UserSelectMenuComponentData['defaultValues'], undefined>[0]>;
    }
}
