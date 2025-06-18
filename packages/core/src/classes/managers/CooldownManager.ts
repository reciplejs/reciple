import { BaseManager } from './BaseManager.js';
import type { Client } from '../structures/Client.js';
import { Cooldown } from '../structures/Cooldown.js';
import type { BaseCooldownAdapter } from '../adapters/BaseCooldownAdapter.js';

export class CooldownManager<A extends BaseCooldownAdapter> extends BaseManager<string, Cooldown, Cooldown.Resolvable> {
    public constructor(client: Client, public readonly adapter: A) {
        super(client, Cooldown);
    }
}
