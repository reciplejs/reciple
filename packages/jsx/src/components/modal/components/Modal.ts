import { ModalBuilder, type ActionRowBuilder, type APIActionRowComponent, type APIComponentInModalActionRow, type ModalActionRowComponentBuilder, type ModalComponentData } from 'discord.js';
import { JSX } from '../../../structures/JSX.js';

export function Modal(props: Modal.Props): ModalBuilder {
    const builder = new ModalBuilder();

    if (props.customId !== undefined) builder.setCustomId(props.customId);
    if (props.title !== undefined) builder.setTitle(props.title);

    builder.addComponents(JSX.useSingleToArray(props.children).filter(d => !!d));
    return builder;
}

export namespace Modal {
    export interface Props extends Omit<ModalComponentData, 'type'|'components'> {
        children?: JSX.SingleOrArray<ActionRowBuilder<ModalActionRowComponentBuilder>|APIActionRowComponent<APIComponentInModalActionRow>>;
    }
}
