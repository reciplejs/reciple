import type { PackageJson } from '@reciple/utils';
import { glob } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface WorkspaceData {
    root: string;
    pkg: Omit<PackageJson, 'name'|'version'> & {
        name: string;
        version: string;
    };
}

export const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../');

export async function resolveWorkspaces(): Promise<WorkspaceData[]> {
    const { workspaces } = await import(`file://${path.join(root, 'package.json')}`, { with: { type: 'json' } }).then(m => m.default ?? m);
    const resolved: WorkspaceData[] = [];

    for (const pattern of workspaces.packages) {
        for await (const dir of glob(pattern, { cwd: root })) {
            const pkg = await import(`file://${path.join(root, dir, 'package.json')}`, { with: { type: 'json' } })
                .then(m => m.default ?? m)
                .catch(() => ({ private: false, version: '', name: '' }));

            if (pkg.private || !pkg.version || !pkg.name) continue;

            resolved.push({ root: path.join(root, dir), pkg });
        }
    }

    return resolved;
}

export function findWorkspaceDependents(name: string, workspaces: WorkspaceData[]): WorkspaceData[] {
    const dependents = workspaces.filter(p => Object.keys({
        ...p.pkg.dependencies,
        ...p.pkg.devDependencies,
        ...p.pkg.peerDependencies,
        ...p.pkg.optionalDependencies
    }).includes(name));

    if (!dependents.length) return [];

    for (const dependent of dependents) {
        const deps = findWorkspaceDependents(dependent.pkg.name, workspaces);

        if (deps.length) dependents.push(...deps);
    }

    return dependents;
}
