// See https://svelte.dev/docs/kit/types#app.d.ts
import type { DiscordMessageOptions } from '@skyra/discord-components-core';
import type { MarkdownMetadata } from '$lib/helpers/types';
import type { MetaTagsProps } from 'svelte-meta-tags';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
            metadata?: MarkdownMetadata;
            pageMetaTags?: MetaTagsProps;
        }
		// interface PageState {}
		// interface Platform {}
	}

    // eslint-disable-next-line no-var
    var $discordMessage: DiscordMessageOptions | undefined;
}

export {};
