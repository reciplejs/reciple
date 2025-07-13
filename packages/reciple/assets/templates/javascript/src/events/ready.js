import { Module } from 'reciple';

export class ReadyEvent extends Module {
    async onEnable({ client }) {
        client.on('ready', () => client.logger);
    }
}

export default new ReadyEvent();
