import { ActionRowBuilder, type MessageActionRowComponentBuilder, type ModalActionRowComponentBuilder } from 'discord.js';
import type { SingleOrArray } from '../../../helpers/types.js';

export function ActionRow({ id, children }: ActionRow.Props) {
    const builder = new ActionRowBuilder({ id });

    if (children !== undefined) builder.addComponents(
        Array.isArray(children)
            ? children
            : [children]
    );

    return builder;
}

export namespace ActionRow {
    export interface Props {
        id?: number;
        children?: SingleOrArray<AnyActionRowComponent>;
    }

    export type AnyActionRowComponent = MessageActionRowComponentBuilder|ModalActionRowComponentBuilder;
    export type AnyActionRowComponentData = ReturnType<(MessageActionRowComponentBuilder|ModalActionRowComponentBuilder)['toJSON']>;
}
