import {
    Client,
    CommandType,
    CooldownAdapter,
    CooldownCommandPrecondition,
    MessageCommandFlagValidatePrecondition,
    MessageCommandOptionValidatePrecondition,
    type BuildConfig,
    type Config,
    type ShardingConfig
} from 'reciple';

export const client = new Client({
    token: process.env.TOKEN,
    intents: [
        'Guilds',
        'GuildMessages',
        'MessageContent'
    ],
    preconditions: [
        new CooldownCommandPrecondition({
            scope: [
                CommandType.Message,
                CommandType.Slash,
                CommandType.ContextMenu
            ],
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

export const config: Config = {
    token: process.env.DISCORD_TOKEN,
    commands: {
        message: {
            prefix: ctx => '!',
            separator: ctx => ' ',
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
    }
};

export const build: BuildConfig = {
    entry: ['./src/**/*.{js,jsx,ts,tsx}'],
    tsconfig: './jsconfig.json',
    outDir: './modules'
};

export const sharding: ShardingConfig = {
    mode: 'process',
};
