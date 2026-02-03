import { subtext } from 'discord.js';
import { JSX } from '../../../jsx-runtime.js';

export function SubText({ children }: SubText.Props): string {
    return subtext(JSX.useStringify(children));
}

export namespace SubText {
    export interface Props {
        children?: JSX.SingleOrArray<any>;
    }
}
