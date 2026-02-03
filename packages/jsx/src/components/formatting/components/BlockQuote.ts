import { blockQuote } from 'discord.js';
import { JSX } from '../../../jsx-runtime.js';

export function BlockQuote({ children }: BlockQuote.Props): string {
    return blockQuote(JSX.useStringify(children));
}

export namespace BlockQuote {
    export interface Props {
        children?: JSX.SingleOrArray<any>;
    }
}
