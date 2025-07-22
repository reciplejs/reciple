import type { PollData, PollQuestionMedia as IPollQuestionMedia } from 'discord.js';
import { JSX } from '../../../structures/JSX.js';

export function PollQuestionMedia(props: PollQuestionMedia.Props): Partial<PollData> {
    return {
        question: {
            text: JSX.useStringify(props.children, props.text),
        }
    };
}

export namespace PollQuestionMedia {
    export interface Props extends Partial<IPollQuestionMedia> {
        children?: JSX.SingleOrArray<any>;
    }
}
