import { quote } from 'discord.js';
import { JSX } from '../../../jsx-runtime.js';

export function Quote({ children }: Quote.Props): string {
    return quote(JSX.useStringify(children));
}

export namespace Quote {
    export interface Props {
        children?: JSX.SingleOrArray<any>;
    }
}
