import { strikethrough } from 'discord.js';
import { JSX } from '../../../jsx-runtime.js';

export function Strike({ children }: Strike.Props): string {
    return strikethrough(JSX.useStringify(children));
}

export namespace Strike {
    export interface Props {
        children?: JSX.SingleOrArray<any>;
    }
}
