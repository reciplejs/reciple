import { Client, CommandType, CooldownAdapter, CooldownCommandPrecondition, MessageCommandValidationPrecondition, type Config } from '@reciple/core';

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
    cooldownAdapter: CooldownAdapter,
    commands: [],
});

export const config: Config = {
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
    }
};
