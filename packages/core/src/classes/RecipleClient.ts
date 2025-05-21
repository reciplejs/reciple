import { Client, type ClientOptions } from 'discord.js';

export class RecipleClient extends Client{
    public constructor(options: RecipleClient.Options) {
        super(options)
    }
}

export namespace RecipleClient {
    export interface Options extends ClientOptions {}
}
