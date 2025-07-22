import type { PollAnswerData, PollData } from 'discord.js';
import { JSX } from '../../../structures/JSX.js';

export function PollAnswers(props: PollAnswers.Props): Partial<PollData> {
    return {
        answers: JSX
            .useSingleToArray(props.children)
            .filter(d => !!d)
    };
}

export namespace PollAnswers {
    export interface Props {
        children?: JSX.SingleOrArray<PollAnswerData>;
    }
}
