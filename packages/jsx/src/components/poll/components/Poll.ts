import type { PollData } from 'discord.js';
import type { SingleOrArray } from '../../../helpers/types.js';

export function Poll(props: Poll.Props): PollData {
    const childrenData = (
        Array.isArray(props.children)
            ? props.children
            : props.children
                ? [props.children]
                : []
    ).reduce((o, d) => ({ ...o, ...d }), {} as PollData);

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
        children?: SingleOrArray<PollData>;
    }
}
