import { MessageCommandBuilder, MessageCommandModule, type MessageCommand } from "reciple";

export class $MODULE_NAME$ extends MessageCommandModule {
    data = new MessageCommandBuilder()
        .setName('$COMMAND_NAME$')
        .setDescription('$COMMAND_DESCRIPTION$')
        .toJSON();

    async execute({ message }: MessageCommand.ExecuteData) {
        // Write your code here
    }
}

export default new $MODULE_NAME$();
