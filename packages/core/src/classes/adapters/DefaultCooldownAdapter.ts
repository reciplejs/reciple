import type { Client } from '../structures/Client.js';
import { BaseCooldownAdapter } from './BaseCooldownAdapter.js';

export class DefaultCooldownAdapter extends BaseCooldownAdapter {
    public constructor(client: Client) {
        super(client);
    }
}
