import { heading, type HeadingLevel } from 'discord.js';
import { JSX } from '../../../jsx-runtime.js';

export function Heading({ children, level }: Heading.Props): string {
    return heading(JSX.useStringify(children), level as number);
}

export namespace Heading {
    export interface Props {
        children?: JSX.SingleOrArray<any>;
        level?: HeadingLevel;
    }
}
