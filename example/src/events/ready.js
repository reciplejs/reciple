// @ts-check
import { ClientEventModule } from 'reciple';

export class ReadyEvent extends ClientEventModule {
    event = 'ready';

    async onEvent(client) {
        this.client.logger.log('Ready!');
    }
}

export default new ReadyEvent();
