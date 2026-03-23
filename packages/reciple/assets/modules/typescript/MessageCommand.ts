import { MessageCommandBuilder, MessageCommandModule, type MessageCommand } from "reciple";

export class $MODULE_NAME$ extends MessageCommandModule {
    public data = new MessageCommandBuilder()
        .setName('$COMMAND_NAME$')
        .setDescription('$COMMAND_DESCRIPTION$')
        .toJSON();

    public async execute({ message }: MessageCommand.ExecuteData): Promise<void> {
        // Write your code here
    }
}

export default new $MODULE_NAME$();
