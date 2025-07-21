import type { EmbedData, EmbedField } from 'discord.js';
import type { SingleOrArray } from '../../../helpers/types.js';

export function EmbedFields(props: EmbedFields.Props): EmbedData {
    return {
        fields: Array.isArray(props.children)
            ? props.children
            : props.children
                ? [props.children]
                : []
    };
}

export namespace EmbedFields {
    export interface Props {
        children?: SingleOrArray<EmbedField>;
    };
}
