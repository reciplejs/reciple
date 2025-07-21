import type { PollData, PollQuestionMedia as IPollQuestionMedia } from 'discord.js';
import type { SingleOrArray } from '../../../helpers/types.js';

export function PollQuestionMedia(props: PollQuestionMedia.Props): Partial<PollData> {
    return {
        question: {
            text: Array.isArray(props.children)
                ? props.children.join(' ')
                : String(props.children ?? props.text)
        }
    };
}

export namespace PollQuestionMedia {
    export interface Props extends Partial<IPollQuestionMedia> {
        children?: SingleOrArray<any>;
    }
}
