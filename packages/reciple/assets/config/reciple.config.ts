import { Client, CommandType, CooldownAdapter, CooldownCommandPrecondition, MessageCommandValidationPrecondition, type BuildConfig, type Config } from 'reciple';

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
        new MessageCommandValidationPrecondition()
    ],
    postconditions: [],
    commands: [],
    cooldownAdapter: CooldownAdapter,
});

export const config: Config = {
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
        ignore: ["./modules/**/_*"],
        filter: undefined
    }
};

export const build: BuildConfig = {
    entry: ['./src/**/*.{js,jsx}'],
    outDir: './modules',
    tsconfig: './jsconfig.json',
    external: [],
    noExternal: [],
    esbuildPlugins: [],
    minify: false,
    keepNames: true,
    sourcemap: true
};
