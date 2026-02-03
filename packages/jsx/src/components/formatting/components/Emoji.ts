import { formatEmoji } from 'discord.js';

export function Emoji({ id, name, animated }: Emoji.Props): string {
    return formatEmoji({
        id,
        name,
        animated,
    });
}

export namespace Emoji {
    export interface Props {
        id: string;
        name?: string;
        animated?: boolean;
    }
}
