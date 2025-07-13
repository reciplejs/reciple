import { Module } from 'reciple';

export class PingCommand extends Module {
    async onEnable({ client }: Module.EventData<false>) {}
}

export default new PingCommand();
