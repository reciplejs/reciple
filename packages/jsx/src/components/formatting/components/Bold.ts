import { bold } from 'discord.js';
import { JSX } from '../../../jsx-runtime.js';

export function Bold({ children }: Bold.Props): string {
    return bold(JSX.useStringify(children));
}

export namespace Bold {
    export interface Props {
        children?: JSX.SingleOrArray<any>;
    }
}
