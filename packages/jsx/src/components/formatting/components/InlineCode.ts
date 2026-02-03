import { inlineCode } from 'discord.js';
import { JSX } from '../../../jsx-runtime.js';

export function InlineCode({ children }: InlineCode.Props): string {
    return inlineCode(JSX.useStringify(children));
}

export namespace InlineCode {
    export interface Props {
        children?: JSX.SingleOrArray<any>
    }
}
