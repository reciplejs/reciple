import { channelMention, linkedRoleMention, roleMention, userMention } from 'discord.js';

export function Mention({ id, type }: Mention.Props): string {
    switch (type) {
        case 'user':
            return userMention(id);
        case 'role':
            return roleMention(id);
        case 'linkedRole':
            return linkedRoleMention(id);
        case 'channel':
            return channelMention(id);
        default:
            throw new Error(`Unknown mention type: ${type}`);
    }
}

export namespace Mention {
    export interface Props {
        id: string;
        type: 'user'|'role'|'linkedRole'|'channel';
    }
}
