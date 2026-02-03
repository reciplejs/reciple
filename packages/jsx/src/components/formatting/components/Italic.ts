import { italic } from 'discord.js';
import { JSX } from '../../../jsx-runtime.js';

export function Italic({ children }: Italic.Props): string {
    return italic(JSX.useStringify(children));
}

export namespace Italic {
    export interface Props {
        children?: JSX.SingleOrArray<any>;
    }
}
