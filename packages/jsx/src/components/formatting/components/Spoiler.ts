import { spoiler } from 'discord.js';
import { JSX } from '../../../jsx-runtime.js';

export function Spoiler({ children }: Spoiler.Props): string {
    return spoiler(JSX.useStringify(children));
}

export namespace Spoiler {
    export interface Props {
        children?: JSX.SingleOrArray<any>;
    }
}
