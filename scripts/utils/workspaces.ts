import type { PackageJson } from '@reciple/utils';
import { glob, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface WorkspaceData {
    root: string;
    pkg: Omit<PackageJson, 'name'|'version'> & {
        name: string;
        version: string;
    };
}

export const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../');

export async function resolveWorkspaces(): Promise<WorkspaceData[]> {
    const { workspaces } = await readFile(path.join(root, 'package.json'), 'utf-8').then(JSON.parse) as PackageJson;
    const patterns = Array.isArray(workspaces) ? workspaces : workspaces?.packages ?? [];
    const resolved: WorkspaceData[] = [];

    for (const pattern of patterns) {
        for await (const dir of glob(pattern, { cwd: root })) {
            const pkg = await readFile(path.join(root, dir, 'package.json'), 'utf-8')
                .then(JSON.parse)
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
