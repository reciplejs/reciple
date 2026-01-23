import type { EmbedData } from 'discord.js';
import { JSX } from '../../../structures/JSX.js';

export function EmbedTitle(props: EmbedTitle.Props): EmbedData {
    return {
        title: JSX.useStringify(props.children)
    };
}

export namespace EmbedTitle {
    export interface Props {
        children?: JSX.SingleOrArray<any>;
    };
}
