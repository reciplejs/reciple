import { ActionRowBuilder, type MessageActionRowComponentBuilder, type ModalActionRowComponentBuilder } from 'discord.js';
import { JSX } from '../../../structures/JSX.js';

export function ActionRow({ id, children }: ActionRow.Props): ActionRowBuilder {
    const builder = new ActionRowBuilder({ id });

    if (children !== undefined) builder.addComponents(JSX.useSingleToArray(children));

    return builder;
}

export namespace ActionRow {
    export interface Props {
        id?: number;
        children?: JSX.SingleOrArray<AnyActionRowComponent>;
    }

    export type AnyActionRowComponent = MessageActionRowComponentBuilder|ModalActionRowComponentBuilder;
    export type AnyActionRowComponentData = ReturnType<(MessageActionRowComponentBuilder|ModalActionRowComponentBuilder)['toJSON']>;
}
