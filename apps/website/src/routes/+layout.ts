import { defineBaseMetaTags } from 'svelte-meta-tags';

export async function load({ url }) {
    return {
        ...defineBaseMetaTags({
            title: 'reciple',
            description: '⚡ Reciple is a Discord.js command framework that just works.',
            keywords: ['reciple', 'discord.js', 'framework'],
            openGraph: {
                type: 'website',
                title: 'reciple',
                siteName: 'reciple',
                description: '⚡ Reciple is a Discord.js command framework that just works.',
                url: url.origin,
            },
            twitter: {
                cardType: 'summary_large_image',
                title: 'reciple',
                description: '⚡ Reciple is a Discord.js command framework that just works.',
                image: `${url.origin}/assets/reciple-art.png`
            },
            robots: true
        })
    }
}
