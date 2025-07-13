import { TemplateBuilder } from './TemplateBuilder.js';

export class RuntimeEnvironment {}

export namespace RuntimeEnvironment {
    export type Type = 'node'|'deno'|'bun';

    export function get(): Type|null {
        if ('isBun' in process && process.isBun) return 'bun';
        if ('deno' in process.versions && process.versions.deno) return 'deno';
        if (process.versions.node) return 'node';

        return null;
    }

    export async function isInstalled(environment: Type): Promise<boolean> {
        return TemplateBuilder.runCommand(`${environment} -v`)
            .then(() => true)
            .catch(() => false);
    }
}
