import { ContextMenuCommandBuilder, ContextMenuCommandModule, type ContextMenuCommand } from "reciple";

export class $MODULE_NAME$ extends ContextMenuCommandModule {
    public data = new ContextMenuCommandBuilder()
        .setName('$COMMAND_NAME$')
        // @ts-expect-error
        .setType($COMMAND_CONTEXT_MENU_TYPE$)
        .toJSON();

    public async execute({ interaction }: ContextMenuCommand.ExecuteData): Promise<void> {
        // Write your code here
    }
}

export default new $MODULE_NAME$();
