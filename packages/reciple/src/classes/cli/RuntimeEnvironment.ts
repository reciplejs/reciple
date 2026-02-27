import { colors } from '@prtty/prtty';
import type { Client } from '@reciple/core';
import { setTimeout } from 'node:timers/promises';

export namespace RuntimeEnvironment {
    let stopping = false;

    export type Type = 'node'|'deno'|'bun';

    export function get(): Type|null {
        if ('isBun' in process && process.isBun && process.versions.bun) return 'bun';
        if ('deno' in process.versions && process.versions.deno) return 'deno';
        if (process.versions.node) return 'node';

        return null;
    }

    export async function sleep(time: number): Promise<void> {
        return setTimeout(time);
    }

    export async function handleExitSignal(client: Client, signal: NodeJS.Signals) {
        if (stopping) return;

        stopping = true;

        client.logger?.warn(`Received exit signal: ${signal}`);

        await client.destroy();
        client.eventListeners.unregisterAll();

        const signalString = signal === 'SIGINT' ? 'keyboard interrupt' : signal === 'SIGTERM' ? 'terminate' : String(signal);

        await sleep(10);

        client.logger?.warn(`Process exited: ${colors.yellow(signalString)}`);
        client.logger?.closeFileWriteStream();
        process.exit(0);
    }
}
