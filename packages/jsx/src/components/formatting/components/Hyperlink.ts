import { hyperlink } from 'discord.js';
import { JSX } from '../../../jsx-runtime.js';

export function Hyperlink({ children, title, url }: Hyperlink.Props): string {
    return title
        ? hyperlink(JSX.useStringify(children), url.toString(), title)
        : hyperlink(JSX.useStringify(children), url.toString());
}

export namespace Hyperlink {
    export interface Props {
        children?: JSX.SingleOrArray<any>;
        title?: string;
        url: string|URL;
    }
}
