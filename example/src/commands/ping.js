// @ts-check
import { MessageCommand, MessageCommandBuilder, MessageCommandModule } from "reciple";

export class PingCommand extends MessageCommandModule {
    data = new MessageCommandBuilder()
        .setName('ping')
        .setDescription('Pong!')
        .setAliases('pong')
        .toJSON();

    /**
     * 
     * @param {MessageCommand.ExecuteData} data 
     */
    async execute(data) {
        data.message.reply('Pong!');
    }
}

export default new PingCommand();
