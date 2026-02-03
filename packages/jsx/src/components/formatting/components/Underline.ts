import { underline } from 'discord.js';
import { JSX } from '../../../jsx-runtime.js';

export function Underline({ children }: Underline.Props): string {
    return underline(JSX.useStringify(children));
}

export namespace Underline {
    export interface Props {
        children?: JSX.SingleOrArray<any>;
    }
}
