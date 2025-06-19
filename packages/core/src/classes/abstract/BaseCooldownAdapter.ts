import type { Client } from '../structures/Client.js';

export abstract class BaseCooldownAdapter {
    public constructor(public readonly client: Client) {}
}

export namespace BaseCooldownAdapter {
    export type Constructor = new (client: Client) => BaseCooldownAdapter;
}
