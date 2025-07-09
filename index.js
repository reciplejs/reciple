// @ts-check
import { Client, MessageCommand } from '@reciple/core';
import 'dotenv/config';

const client = new Client({
    intents: [
        'Guilds',
        'GuildMessages',
        'MessageContent'
    ]
});

client.on('ready', () => {
    console.log(`${client.user?.displayName} is ready!`);

    client.commands?.add(
        new MessageCommand()
            .setData(data => data
                .setName('ping')
                .setDescription('Ping pong!')
                .setAliases('pong')
            )
            .setExecute(async ({ message }) => {
                await message.reply('Pong!');
            })
    );
});

await client.login(process.env.DISCORD_TOKEN ?? '');
