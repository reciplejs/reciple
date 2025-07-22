import { ButtonBuilder, type Awaitable, type BaseButtonComponentData, type ButtonInteraction } from 'discord.js';
import { JSX } from '../../../structures/JSX.js';

export function Button(props: Button.Props) {
    const builder = new ButtonBuilder();

    if (props.id !== undefined) builder.setId(props.id);
    if (props.customId !== undefined) builder.setCustomId(props.customId);
    if (props.disabled !== undefined) builder.setDisabled(props.disabled);
    if (props.emoji !== undefined) builder.setEmoji(props.emoji);
    if (props.skuId !== undefined) builder.setSKUId(props.skuId);
    if (props.style !== undefined) builder.setStyle(props.style);
    if (props.url !== undefined) builder.setURL(props.url);

    builder.setLabel(JSX.useStringify(props.children, props.label));

    return builder;
}

export namespace Button {
    export interface Props extends Omit<BaseButtonComponentData, 'type'> {
        url?: string;
        customId?: string;
        skuId?: string;
        children?: JSX.SingleOrArray<any>;
        // TODO: Implement button actions
        onClick?: (interaction: ButtonInteraction) => Awaitable<void>;
    }
}
