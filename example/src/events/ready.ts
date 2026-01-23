import { ClientEventModule, type Client } from 'reciple';

export class ReadyEvent extends ClientEventModule<'clientReady'> {
    event = 'clientReady' as const;

    async onEvent(client: Client<true>) {
        client.logger.log('This is a ready event. Client is now Ready!');
    }
}

export default new ReadyEvent();
