import { SlashCommandBuilder, SlashCommandModule, type SlashCommand } from "reciple";

export class $MODULE_NAME$ extends SlashCommandModule {
    public data = new SlashCommandBuilder()
        .setName('$COMMAND_NAME$')
        .setDescription('$COMMAND_DESCRIPTION$')
        .toJSON();

    public async execute({ interaction }: SlashCommand.ExecuteData): Promise<void> {
        // Write your code here
    }
}

export default new $MODULE_NAME$();
