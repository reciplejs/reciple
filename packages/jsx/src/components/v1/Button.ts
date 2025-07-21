import { ButtonBuilder, type Awaitable, type BaseButtonComponentData, type ButtonInteraction } from 'discord.js';

export function Button(props: Button.Props) {
    const builder = new ButtonBuilder();

    if (props.id !== undefined) builder.setId(props.id);
    if (props.customId !== undefined) builder.setCustomId(props.customId);
    if (props.disabled !== undefined) builder.setDisabled(props.disabled);
    if (props.emoji !== undefined) builder.setEmoji(props.emoji);
    if (props.label !== undefined) builder.setLabel(props.label);
    if (props.skuId !== undefined) builder.setSKUId(props.skuId);
    if (props.style !== undefined) builder.setStyle(props.style);
    if (props.url !== undefined) builder.setURL(props.url);

    if (props.children !== undefined) builder.setLabel(
        Array.isArray(props.children)
            ? props.children.join(' ')
            : String(props.children)
    );

    return builder;
}

export namespace Button {
    export interface Props extends Omit<BaseButtonComponentData, 'type'> {
        url?: string;
        customId?: string;
        skuId?: string;
        children?: any;
        // TODO: Implement button actions
        onClick?: (interaction: ButtonInteraction) => Awaitable<void>;
    }
}
