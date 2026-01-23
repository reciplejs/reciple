// @ts-check
import { MessageCommandBuilder, MessageCommandModule } from "reciple";

export class $MODULE_NAME$ extends MessageCommandModule {
    data = new MessageCommandBuilder()
        .setName('$COMMAND_NAME$')
        .setDescription('$COMMAND_DESCRIPTION$')
        .toJSON();

    /** @param {import('reciple').MessageCommand.ExecuteData} param0 */
    async execute({ message }) {
        // Write your code here
    }
}

export default new $MODULE_NAME$();
