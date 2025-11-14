// @ts-check
import { Client, CommandType, CooldownAdapter, CooldownCommandPrecondition, MessageCommandFlagValidatePrecondition, MessageCommandOptionValidatePrecondition } from 'reciple';

export const client = new Client({
    token: process.env.TOKEN,
    intents: [
        'Guilds',
        'GuildMessages',
        'MessageContent'
    ],
    preconditions: [
        new CooldownCommandPrecondition({
            scope: [CommandType.Message, CommandType.Slash, CommandType.ContextMenu],
            matchWithin: 'global',
            deleteWhenExpired: true
        }),
        new MessageCommandOptionValidatePrecondition(),
        new MessageCommandFlagValidatePrecondition()
    ],
    postconditions: [],
    commands: [],
    cooldownAdapter: CooldownAdapter,
});

/**
 * @type {import('reciple').Config}
 */
export const config = {
    token: process.env.DISCORD_TOKEN,
    commands: {
        message: {
            prefix: context => '!',
            separator: context => ' ',
            splitOptions: {},
            throwOnExecuteError: true
        },
        slash: {
            acceptRepliedInteraction: true,
            throwOnExecuteError: true
        },
        contextMenu: {
            acceptRepliedInteraction: true,
            throwOnExecuteError: true
        },
    },
    applicationCommandsRegister: {
        slashCommands: {
            registerToGuilds: false,
            registerGlobally: true
        },
        contextMenuCommands: {
            registerToGuilds: false,
            registerGlobally: true
        },
        registerToGuilds: false,
        registerGlobally: true,
        allowEmptyCommands: true
    },
    cooldowns: {
        sweeperOptions: {
            interval: 1000 * 60 * 60,
            fetchAll: false
        }
    },
    preconditions: {
        returnOnFailure: false
    },
    postconditions: {
        returnOnFailure: false
    },
    modules: {
        directories: ["./modules/**"],
        ignore: ["_*"],
        filter: undefined
    },
    logger: useLogger().clone({
        debugmode: {
            enabled: true
        }
    })
};

/**
 * @type {import('reciple').BuildConfig}
 */
export const build = {
    entry: ['./src/**/*.{ts,tsx,js,jsx}'],
    outDir: './modules',
    tsconfig: './tsconfig.json',
    external: [],
    noExternal: [],
    esbuildPlugins: [],
    minify: false,
    keepNames: true,
    sourcemap: true
};
