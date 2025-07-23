import { ChannelSelectMenuBuilder, type ChannelSelectMenuComponentData } from 'discord.js';
import { JSX } from '../../../structures/JSX.js';

export function ChannelSelectMenu(props: ChannelSelectMenu.Props): ChannelSelectMenuBuilder {
    const builder = new ChannelSelectMenuBuilder();

    if (props.id !== undefined) builder.setId(props.id);
    if (props.customId !== undefined) builder.setCustomId(props.customId);
    if (props.disabled !== undefined) builder.setDisabled(props.disabled);
    if (props.maxValues !== undefined) builder.setMaxValues(props.maxValues);
    if (props.minValues !== undefined) builder.setMinValues(props.minValues);
    if (props.placeholder !== undefined) builder.setPlaceholder(props.placeholder);
    if (props.channelTypes !== undefined) builder.setChannelTypes(...props.channelTypes);
    if (props.defaultValues !== undefined) builder.setDefaultChannels(...props.defaultValues.map(c => c.id));

    if (props.children !== undefined) {
        builder.addDefaultChannels(...JSX.useSingleToArray(props.children).map(o => o.id));
    }

    return builder;
}

export namespace ChannelSelectMenu {
    export interface Props extends Omit<ChannelSelectMenuComponentData, 'type'> {
        children?: JSX.SingleOrArray<Exclude<ChannelSelectMenuComponentData['defaultValues'], undefined>[0]>;
    }
}
