// @ts-check
import { ContextMenuCommandBuilder, ContextMenuCommandModule } from "reciple";

export class $MODULE_NAME$ extends ContextMenuCommandModule {
    data = new ContextMenuCommandBuilder()
        .setName('$COMMAND_NAME$')
        // @ts-expect-error
        .setType($COMMAND_CONTEXT_MENU_TYPE$)
        .toJSON();

    /** @param {import('reciple').ContextMenuCommand.ExecuteData} param0 */
    async execute({ interaction }) {
        // Write your code here
    }
}

export default new $MODULE_NAME$();
