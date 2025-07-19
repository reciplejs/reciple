import { ContextMenuCommandBuilder, ContextMenuCommandModule, type ContextMenuCommand } from "reciple";

export class $MODULE_NAME$ extends ContextMenuCommandModule {
    data = new ContextMenuCommandBuilder()
        .setName('$COMMAND_NAME$')
        // @ts-expect-error
        .setType($COMMAND_CONTEXT_MENU_TYPE$)
        .toJSON();

    async execute({ interaction }: ContextMenuCommand.ExecuteData) {
        // Write your code here
    }
}

export default new $MODULE_NAME$();
