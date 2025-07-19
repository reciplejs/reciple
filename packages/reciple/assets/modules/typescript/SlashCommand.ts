import { SlashCommandBuilder, SlashCommandModule, type SlashCommand } from "reciple";

export class $MODULE_NAME$ extends SlashCommandModule {
    data = new SlashCommandBuilder()
        .setName('$COMMAND_NAME$')
        .setDescription('$COMMAND_DESCRIPTION$')
        .toJSON();

    async execute({ interaction }: SlashCommand.ExecuteData) {
        // Write your code here
    }
}

export default new $MODULE_NAME$();
