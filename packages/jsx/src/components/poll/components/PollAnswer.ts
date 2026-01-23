import type { PollAnswerData } from 'discord.js';
import { JSX } from '../../../structures/JSX.js';

export function PollAnswer(props: PollAnswer.Props): PollAnswerData {
    return {
        emoji: props.emoji,
        text: JSX.useStringify(props.children, props.text)
    };
}

export namespace PollAnswer {
    export interface Props extends Partial<PollAnswerData> {
        children?: JSX.SingleOrArray<any>;
    }
}
