import { Module } from 'reciple';

export class PingCommand extends Module {
    async onEnable({ client }) {}
}

export default new PingCommand();
