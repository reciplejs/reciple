import type { Client } from '../structures/Client.js';
import { BaseCooldownAdapter } from '../abstract/BaseCooldownAdapter.js';

export class CooldownAdapter extends BaseCooldownAdapter {
    public constructor(client: Client) {
        super(client);
    }
}
