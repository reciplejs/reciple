import { ActionRowBuilder } from 'discord.js';
import type { SingleOrArray } from '../../helpers/types.js';

export function ActionRow({ id, children }: ActionRow.Props) {
    const builder = new ActionRowBuilder({ id });

    if (children !== undefined) builder.addComponents(children);

    return builder;
}

export namespace ActionRow {
    export interface Props {
        id?: number;
        children?: SingleOrArray<AnyActionRowChild>;
    }

    export type AnyActionRowChild = any;
}
