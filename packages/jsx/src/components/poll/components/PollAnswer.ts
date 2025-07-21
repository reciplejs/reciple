import type { PollAnswerData } from 'discord.js';
import type { SingleOrArray } from '../../../helpers/types.js';

export function PollAnswer(props: PollAnswer.Props): PollAnswerData {
    return {
        emoji: props.emoji,
        text: Array.isArray(props.children)
            ? props.children.join(' ')
            : String(props.children ?? props.text)
    };
}

export namespace PollAnswer {
    export interface Props extends Partial<PollAnswerData> {
        children?: SingleOrArray<any>;
    }
}
