import type { EmbedData, EmbedFooterOptions } from 'discord.js';
import type { SingleOrArray } from '../../../helpers/types.js';

export function EmbedFooter(props: EmbedFooter.Props): EmbedData {
    return {
        footer: {
            text: Array.isArray(props.children)
                ? props.children.join(' ')
                : props.children
                    ? String(props.children)
                    : props.text,
            iconURL: props.iconURL
        }
    }
}

export namespace EmbedFooter {
    export interface Props extends EmbedFooterOptions {
        children?: SingleOrArray<any>;
    }
}
