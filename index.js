// @ts-check
import { CommandPostcondition, CommandPrecondition, Client, CommandPostconditionReason, CommandType, CooldownCommandPrecondition, MessageCommand, MessageCommandValidationPrecondition } from '@reciple/core';
import { time } from 'discord.js';
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
            .setCooldown(20000)
            .setExecute(async data => {
                /**
                 * @type {number}
                 */
                const times = await data.options.getOptionResolvedValue('times', false) || 1;

                await data.message.reply(('Pong!\n').repeat(times));
            })
            .addPostconditions(new CooldownPostcondition())
    );
});

class CooldownPostcondition extends CommandPostcondition {
    scope = [];

    /**
     * 
     * @param {CommandPostcondition.ExecuteData<CommandType>} data
     * @param {CommandPrecondition.ResultData<CommandType>} preconditionTrigger 
     */
    async execute(data, preconditionTrigger) {
        if (data.reason !== CommandPostconditionReason.Cooldown) return false;
        console.log(`Postcondition: ${CommandPostconditionReason[data.reason]} triggered for ${data.executeData.command.data.name}`);;

        const response = {
            content: `You are on cooldown. for ${time(data.cooldown.endsAt, 'R')}`,
            ephemeral: true
        };

        switch (data.executeData.type) {
            case CommandType.Message:
                await data.executeData.message.reply(response);
                break;
            case CommandType.Slash:
            case CommandType.ContextMenu:
                await data.executeData.interaction.reply(response);
                break;
        }

        return true;
    }
}

await client.login(process.env.DISCORD_TOKEN ?? '');
