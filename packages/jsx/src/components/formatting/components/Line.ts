import { JSX } from '../../../jsx-runtime.js';

export function Line({ children }: Line.Props): string {
    const line = JSX.useStringify(children);

    return `${line}\n`;
}

export namespace Line {
    export interface Props {
        children?: JSX.SingleOrArray<any>;
    }
}
