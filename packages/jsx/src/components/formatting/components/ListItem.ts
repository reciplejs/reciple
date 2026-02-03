import { JSX } from '../../../jsx-runtime.js';

export function ListItem({ children }: ListItem.Props): string {
    return JSX.useStringify(children);
}

export namespace ListItem {
    export interface Props {
        children?: JSX.SingleOrArray<any>;
    }
}
