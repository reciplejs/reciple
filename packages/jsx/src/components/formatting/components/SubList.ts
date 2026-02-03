import type { RecursiveArray } from 'discord.js';

export function SubList({ children }: SubList.Props): RecursiveArray<string> {
    return children ?? [];
}

export namespace SubList {
    export interface Props {
        children?: RecursiveArray<string>;
    }
}
