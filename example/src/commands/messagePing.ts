import { MessageCommand, MessageCommandBuilder, MessageCommandModule } from "reciple";

export class MessagePingCommand extends MessageCommandModule {
    data = new MessageCommandBuilder()
        .setName('ping')
        .setDescription('Pong!')
        .setAliases('pong')
        .toJSON();

    async execute(data: MessageCommand.ExecuteData) {
        await data.message.reply('Pong!');
    }
}

export default new MessagePingCommand();
