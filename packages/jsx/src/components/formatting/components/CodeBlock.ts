import { codeBlock } from 'discord.js';
import { JSX } from '../../../jsx-runtime.js';

export function CodeBlock({ children, lang }: CodeBlock.Props): string {
    return lang
        ? codeBlock(lang, JSX.useStringify(children))
        : codeBlock(JSX.useStringify(children));
}

export namespace CodeBlock {
    export interface Props {
        children?: JSX.SingleOrArray<any>;
        lang?: string;
    }
}
