// @ts-check
import { SlashCommandBuilder, SlashCommandModule } from "reciple";

export class $MODULE_NAME$ extends SlashCommandModule {
    data = new SlashCommandBuilder()
        .setName('$COMMAND_NAME$')
        .setDescription('$COMMAND_DESCRIPTION$')
        .toJSON();

    /** @param {import('reciple').SlashCommand.ExecuteData} param0 */
    async execute({ interaction }) {
        // Write your code here
    }
}

export default new $MODULE_NAME$();
