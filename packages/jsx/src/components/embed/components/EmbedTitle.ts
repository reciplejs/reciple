import type { EmbedData } from 'discord.js';
import type { SingleOrArray } from '../../../helpers/types.js';

export function EmbedTitle(props: EmbedTitle.Props): EmbedData {
    return {
        title: Array.isArray(props.children)
            ? props.children.join(' ')
            : String(props.children)
    };
}

export namespace EmbedTitle {
    export interface Props {
        children?: SingleOrArray<any>;
    };
}
