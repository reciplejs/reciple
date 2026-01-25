import type { PackageJson } from '@reciple/utils';
import { cancel, intro, isCancel, multiselect, outro, select, text } from '@clack/prompts';
import { colors } from '@prtty/prtty';
import { glob } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { exec } from 'node:child_process';

export interface WorkspaceData { root: string; pkg: PackageJson; }

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../');
const packages: WorkspaceData[] = [];

const { workspaces } = await import('../package.json', { with: { type: 'json' } }).then(m => m.default ?? m);

for (const pattern of workspaces.packages) {
    for await (const dir of glob(pattern, { cwd: root })) {
        const pkg = await import(`file://${path.join(root, dir, 'package.json')}`, { with: { type: 'json' } })
            .then(m => m.default ?? m)
            .catch(() => ({ private: false, version: '' }));

        if (pkg.private || !pkg.version) continue;

        packages.push({ root: path.join(root, dir), pkg });
    }
}

intro(colors.bold().black().bgCyan(` Found ${packages.length} packages `));

const selected = await multiselect({
    message: 'Select a package to bump',
    options: packages.map(pkg => ({ label: pkg.pkg.name, value: pkg.root }))
});

if (isCancel(selected)) {
    cancel(`Operation cancelled.`);
    process.exit(0);
}

const dependents = selected
    .map(dir => packages.find(p => p.root === dir)!)
    .flatMap(p => p ? findDependents(p.pkg) : []);

if (dependents.length) {
    const selectedDependents = await multiselect({
        message: 'Packages with dependents will also be bumped',
        initialValues: dependents.map(p => p.root),
        options: dependents.map(pkg => ({ label: pkg.pkg.name, value: pkg.root }))
    });

    if (isCancel(selectedDependents)) {
        cancel(`Operation cancelled.`);
        process.exit(0);
    }

    selected.push(...selectedDependents);
}

let bump: string|null|symbol = await select({
    message: 'Select a bump type',
    options: [
        { label: 'Custom', value: null },
        { label: 'Major', value: 'major' },
        { label: 'Patch', value: 'patch' },
        { label: 'Minor', value: 'minor' },
        { label: 'Pre-patch', value: 'prepatch' },
        { label: 'Pre-minor', value: 'preminor' },
        { label: 'Pre-major', value: 'premajor' },
        { label: 'Pre-release', value: 'prerelease' },
        { label: 'From git', value: 'from-git' }
    ]
});

bump ??= await text({
    message: 'Enter a new version',
    initialValue: 'patch'
});

if (isCancel(bump)) {
    cancel(`Operation cancelled.`);
    process.exit(0);
}

outro(colors.bold().black().bgCyan(` Bumping ${selected.length} packages `));

for (const dir of selected) {
    const workspace = packages.find(p => p.root === dir);
    if (!workspace) continue;

    await bumpWorkspace(workspace, bump);
}

async function bumpWorkspace(workspace: WorkspaceData, bump: string): Promise<void> {
    const child = exec(`bun pm version ${bump}`, {
        cwd: workspace.root
    });

    let output = '';

    child.stdout?.on('data', chunk => output += chunk.toString());
    child.stderr?.on('data', chunk => output += chunk.toString());

    await new Promise<void>((res, rej) => {
        child.once('error', rej);
        child.once('close', code => {
            if (code) {
                console.error(output);
                rej(new Error(`Exited with code: ${code}`, { cause: output }));
            } else {
                res(void 0);
            }
        });
    });

    console.log(`Bumped ${colors.cyan(`(${workspace.pkg.name})`)} ${colors.green(workspace.root)}`);
}

function findDependents(pkg: PackageJson): WorkspaceData[] {
    if (!pkg.name) return [];

    const dependents = packages.filter(p => Object.keys({
        ...p.pkg.dependencies,
        ...p.pkg.devDependencies,
        ...p.pkg.peerDependencies,
        ...p.pkg.optionalDependencies
    }).includes(pkg.name!));

    if (!dependents.length) return [];

    for (const dependent of dependents) {
        const deps = findDependents(dependent.pkg);

        if (deps.length) dependents.push(...deps);
    }

    return dependents;
}
