import type { PollData } from 'discord.js';
import { JSX } from '../../../structures/JSX.js';

export function Poll(props: Poll.Props): PollData {
    const childrenData = JSX
        .useSingleToArray(props.children)
        .filter(d => !!d)
        .reduce((o, d) => ({ ...o, ...d }), {} as PollData);

    return {
        ...childrenData,
        layoutType: props.layoutType,
        duration: props.duration ?? 24,
        allowMultiselect: props.allowMultiselect ?? false
    };
}

export namespace Poll {
    export interface Props extends Pick<PollData, 'layoutType'> {
        duration?: number;
        allowMultiselect?: boolean;
        children?: JSX.SingleOrArray<PollData>;
    }
}
