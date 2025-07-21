import type { EmbedAuthorOptions, EmbedData } from 'discord.js';
import type { SingleOrArray } from '../../../helpers/types.js';

export function EmbedAuthor(props: EmbedAuthor.Props): EmbedData {
    return {
        author: {
            name: Array.isArray(props.children)
                ? props.children.join(' ')
                : props.children
                    ? String(props.children)
                    : props.name,
            url: props.url,
            iconURL: props.iconURL
        }
    }
}

export namespace EmbedAuthor {
    export interface Props extends EmbedAuthorOptions {
        children?: SingleOrArray<any>;
    }
}
