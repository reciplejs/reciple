import type { EmbedData, EmbedFooterOptions } from 'discord.js';
import { JSX } from '../../../structures/JSX.js';

export function EmbedFooter(props: EmbedFooter.Props): EmbedData {
    return {
        footer: {
            text: JSX.useStringify(props.children, props.text),
            iconURL: props.iconURL
        }
    }
}

export namespace EmbedFooter {
    export interface Props extends EmbedFooterOptions {
        children?: JSX.SingleOrArray<any>;
    }
}
