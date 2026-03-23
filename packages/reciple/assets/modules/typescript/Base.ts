import { BaseModule } from 'reciple';

export class $MODULE_NAME$ extends BaseModule {
    public async onEnable({ client }: BaseModule.EventData<false>): Promise<void> {
        // Write your code here
    }

    public async onReady({ client }: BaseModule.EventData<true>): Promise<void> {
        // Write your code here
    }

    public async onDisable({ client }: BaseModule.EventData<true>): Promise<void> {
        // Write your code here
    }
}

export default new $MODULE_NAME$();
