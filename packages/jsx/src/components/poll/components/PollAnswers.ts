import type { PollAnswerData, PollData } from 'discord.js';
import type { SingleOrArray } from '../../../helpers/types.js';

export function PollAnswers(props: PollAnswers.Props): Partial<PollData> {
    return {
        answers: Array.isArray(props.children)
            ? props.children
            : props.children
                ? [props.children]
                : []
    };
}

export namespace PollAnswers {
    export interface Props {
        children?: SingleOrArray<PollAnswerData>;
    }
}
