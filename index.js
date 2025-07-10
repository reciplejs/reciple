// @ts-check
import { Client, CooldownCommandPrecondition, MessageCommand, MessageCommandValidationPrecondition } from '@reciple/core';
import 'dotenv/config';

const client = new Client({
    intents: [
        'Guilds',
        'GuildMessages',
        'MessageContent'
    ],
    preconditions: [
        new CooldownCommandPrecondition(),
        new MessageCommandValidationPrecondition()
    ]
});

client.on('ready', () => {
    console.log(`${client.user?.displayName} is ready!`);

    client.commands?.add(
        new MessageCommand()
            .setCommand(data => data
                .setName('ping')
                .setDescription('Ping pong!')
                .setAliases('pong')
                .addOption(option => option
                    .setName('times')
                    .setDescription('The number of times to ping.')
                    .setValidate(({ value }) => !isNaN(Number(value)))
                    .setResolve(({ value }) => Number(value))
                    .setRequired(false)
                )
            )
            .setExecute(async data => {
                /**
                 * @type {number}
                 */
                const times = await data.options.getOptionResolvedValue('times', false) || 1;

                await data.message.reply(('Pong!\n').repeat(times));
            })
    );
});

await client.login(process.env.DISCORD_TOKEN ?? '');
