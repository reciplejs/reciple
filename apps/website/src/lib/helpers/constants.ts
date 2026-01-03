import { resolve } from '$app/paths';
import type { DiscordMessageOptions } from '@skyra/discord-components-core';

export const Links = {
    github: 'https://github.com/reciplejs/reciple',
    discord: 'https://discord.gg/KxfPZYuTGV',
    discordJs: 'https://discord.js.org/',
}

export const DiscordComponentConfig: DiscordMessageOptions = {
    emojis: {},
    profiles: {
        cat: {
            author: 'Cat++',
            avatar: 'https://avatars.githubusercontent.com/u/69035887?v=4',
        },
        bot: {
            author: 'Guide Bot',
            avatar: resolve('/') + '/favicon.png',
            bot: true,
            verified: true
        }
    }
}
