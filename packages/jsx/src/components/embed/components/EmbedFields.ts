import type { EmbedData, EmbedField } from 'discord.js';
import { JSX } from '../../../structures/JSX.js';

export function EmbedFields(props: EmbedFields.Props): EmbedData {
    return {
        fields: JSX
            .useSingleToArray(props.children)
            .filter(d => !!d)
    };
}

export namespace EmbedFields {
    export interface Props {
        children?: JSX.SingleOrArray<EmbedField>;
    };
}
