import type { EmbedAuthorOptions, EmbedData } from 'discord.js';
import { JSX } from '../../../structures/JSX.js';

export function EmbedAuthor(props: EmbedAuthor.Props): EmbedData {
    return {
        author: {
            name: JSX.useStringify(props.children, props.name),
            url: props.url,
            iconURL: props.iconURL
        }
    }
}

export namespace EmbedAuthor {
    export interface Props extends EmbedAuthorOptions {
        children?: JSX.SingleOrArray<any>;
    }
}
