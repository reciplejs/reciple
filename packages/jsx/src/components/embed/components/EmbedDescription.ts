import type { EmbedData } from 'discord.js';
import type { SingleOrArray } from '../../../helpers/types.js';

export function EmbedDescription(props: EmbedDescription.Props): EmbedData {
    return {
        description: Array.isArray(props.children)
            ? props.children.join(' ')
            : String(props.children)
    };
}

export namespace EmbedDescription {
    export interface Props {
        children?: SingleOrArray<any>;
    };
}
