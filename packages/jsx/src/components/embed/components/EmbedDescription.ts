import type { EmbedData } from 'discord.js';
import { JSX } from '../../../structures/JSX.js';

export function EmbedDescription(props: EmbedDescription.Props): EmbedData {
    return {
        description: JSX.useStringify(props.children)
    };
}

export namespace EmbedDescription {
    export interface Props {
        children?: JSX.SingleOrArray<any>;
    };
}
