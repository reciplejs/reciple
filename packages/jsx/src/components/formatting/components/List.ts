import { orderedList, unorderedList, type RecursiveArray } from 'discord.js';

export function List({ children, type, start }: List.Props): string {
    children ??= [];
    type ??= 'unordered';

    switch (type) {
        case 'ordered':
            return orderedList(children, start);
        case 'unordered':
            return unorderedList(children);
    }
}

export namespace List {
    export interface Props {
        children?: RecursiveArray<string>;
        type?: 'ordered'|'unordered';
        start?: number;
    }
}
