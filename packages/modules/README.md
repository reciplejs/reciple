<div align="center">
    <img src="https://i.imgur.com/C3gWxwc.png" width="50%">
    <p align="center">
        <b>A Discord.js framework that just works.</b>
    </p>
    <br>
</div>

<h3 align="center">
    <a href="https://discord.gg/KxfPZYuTGV">
        <img src="https://img.shields.io/discord/1453743492722458708?color=5865F2&logo=discord&logoColor=white">
    </a>
    <a href="https://npmjs.org/package/@reciple/modules">
        <img src="https://img.shields.io/npm/v/@reciple/modules?label=npm">
    </a>
    <a href="https://github.com/reciplejs/reciple/tree/main/packages/modules">
        <img src="https://img.shields.io/npm/dt/@reciple/modules?maxAge=3600">
    </a>
    <a href="https://www.codefactor.io/repository/github/reciplejs/reciple">
        <img src="https://www.codefactor.io/repository/github/reciplejs/reciple/badge">
    </a>
    <br>
    <div style="padding-top: 1rem">
        <a href="https://discord.gg/KxfPZYuTGV">
            <img src="http://invidget.switchblade.xyz/KxfPZYuTGV">
        </a>
    </div>
</h3>

## About

`@reciple/modules` A JSX wrapper for [Discord.js](https://discord.js.org/) builders.

## Installation

```bash
npm install @reciple/modules
yarn add @reciple/modules
pnpm add @reciple/modules
bun install @reciple/modules
deno install npm:@reciple/modules
```

## Usage

Create a new reciple module file then create a new module instance as the default export.

### Anticrash

A module that catches process and client errors that cause the bot to crash then logs them to a channel if specified.

```js
// example/src/addons/antiCrash.js
import { RecipleAnticrash } from '@reciple/modules';

export default new RecipleAnticrash({
    // The channels to report errors to
    reportChannels: ['000000000000000000'],

    // The base options for the report message
    baseReportMessageOptions: {
        content: 'An error has occurred!',
    }
});
```

### Registry Cache

A module that caches the application commands to prevent unnecessary requests to the Discord API when registering commands that haven't changed.

```js
// example/src/addons/registryCache.js
import { RecipleRegistryCache } from '@reciple/modules';

export default new RecipleRegistryCache({
    // Cache duration in milliseconds
    maxCacheAgeMs: 24 * 60 * 60 * 1000,

    // The directory to store the cache in
    cacheDir: '.cache/reciple-registry/',

    // The environment variable to check if the cache is enabled
    cacheEnabledEnv: 'RECIPLE_REGISTRY_CACHE',

    // Create a cache entry even if the cache is disabled
    createCacheEntryEvenIfDisabled: true
});
```

### Interaction Events

A module that handles interaction events and executes listeners based on the interaction type. The listeners are resolved from the specified module property.

```js
// example/src/addons/interactionEvents.js
import { RecipleInteractionEvents } from '@reciple/modules';

export default new RecipleInteractionEvents({
    // Filters the modules to resolve listeners from
    ignoredModules: (module) => module.id === 'ignored_id',

    // The module property to resolve listeners from
    moduleEventListenersProperty: ['interactions']
});
```

```js
// example/src/commands/ping.js
import { InteractionListenerBuilder, InteractionListenerType } from '@reciple/modules';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { SlashCommandBuilder, SlashCommandModule, type SlashCommand } from 'reciple';

export class ButtonPingCommand extends SlashCommandModule {
    data = new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Test ping command')
        .toJSON();

    /**
     * @type {InteractionListenerBuilder[]}
     */
    interactions = [
        new InteractionListenerBuilder()
            .setType(InteractionListenerType.Button)
            .setFilter(interaction => interaction.customId === 'ping')
            .setExecute(async interaction => {
                await interaction.reply({
                    content: 'Pong!',
                    ephemeral: true
                });
            })
    ];

    /**
     * @param {SlashCommand.ExecuteData} data
     */
    async execute(data) {
        await data.interaction.reply({
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('ping')
                            .setLabel('Ping')
                            .setStyle(ButtonStyle.Primary)
                    )
            ]
        });
    }
}

export default new ButtonPingCommand();
```

## Links

- [Website](https://reciple.js.org)
- [Discord](https://discord.gg/KxfPZYuTGV)
- [Github](https://github.com/reciplejs/reciple/tree/main/packages/modules)
- [NPM](https://npmjs.org/package/@reciple/modules)
