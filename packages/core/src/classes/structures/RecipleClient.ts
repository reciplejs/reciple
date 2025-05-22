import { Client, type ClientOptions } from 'discord.js';

export class RecipleClient<Ready extends boolean = boolean> extends Client<Ready> {
    public constructor(options: RecipleClient.Options) {
        super(options);
    }

    public isReady(): this is RecipleClient<true> {
        return super.isReady();
    }
}

export namespace RecipleClient {
    export interface Options extends ClientOptions {}
}
