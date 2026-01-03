// See https://svelte.dev/docs/kit/types#app.d.ts
import type { DiscordMessageOptions } from '@skyra/discord-components-core';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

    // eslint-disable-next-line no-var
    var $discordMessage: DiscordMessageOptions | undefined;
}

export {};
