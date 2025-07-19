import { BaseModule } from 'reciple';

export class $MODULE_NAME$ extends BaseModule {
    async onEnable({ client }: BaseModule.EventData<false>) {
        // Write your code here
    }

    async onReady({ client }: BaseModule.EventData<true>) {
        // Write your code here
    }

    async onDisable({ client }: BaseModule.EventData<true>) {
        // Write your code here
    }
}

export default new $MODULE_NAME$();
