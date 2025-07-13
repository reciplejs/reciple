import { Module } from 'reciple';

export class ReadyEvent extends Module {
    async onEnable({ client }: Module.EventData<false>) {
        client.on('ready', () => client.logger.log('Ready!'));
    }
}

export default new ReadyEvent();
