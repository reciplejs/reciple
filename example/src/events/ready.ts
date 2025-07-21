import { ClientEventModule, type Client } from 'reciple';

export class ReadyEvent extends ClientEventModule<'ready'> {
    event = 'ready' as const;

    async onEvent(client: Client<true>) {
        client.logger.log('Ready!');
    }
}

export default new ReadyEvent();
