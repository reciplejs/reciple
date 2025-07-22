import { ModalBuilder, type ActionRowBuilder, type APIActionRowComponent, type APIComponentInModalActionRow, type Awaitable, type ModalActionRowComponentBuilder, type ModalComponentData, type ModalSubmitInteraction } from 'discord.js';
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
        // TODO: Implement action for prop `onSubmit`
        onSubmit?: (interaction: ModalSubmitInteraction) => Awaitable<void>;
    }
}
