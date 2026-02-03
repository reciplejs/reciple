import { hideLinkEmbed } from 'discord.js';

export function HideLinkEmbed({ url }: HideLinkEmbed.Props): string {
    return hideLinkEmbed(url);
}

export namespace HideLinkEmbed {
    export interface Props {
        url: string;
    }
}
