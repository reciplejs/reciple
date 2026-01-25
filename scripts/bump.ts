import type { PackageJson } from '@reciple/utils';
import { cancel, confirm, intro, isCancel, log, multiselect, outro, select, text } from '@clack/prompts';
import { colors } from '@prtty/prtty';
import { glob } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { exec, type ExecOptions } from 'node:child_process';

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
    .flatMap(p => p ? findDependents(p.pkg) : [])
    .filter(p => !selected.includes(p.root))
    .filter((p, i, arr) => arr.indexOf(p) === i);

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

for (const dir of selected) {
    const workspace = packages.find(p => p.root === dir);
    if (!workspace) continue;

    await bumpWorkspace(workspace, bump);
}

const publish = await confirm({
    message: 'Would you like to publish?',
    initialValue: true
});

if (publish === true) {
    for (const workspace of packages) {
        await publishWorkspace(workspace);
    }
}

outro(`${colors.bold().green('✔')} Finished!`);

async function bumpWorkspace(workspace: WorkspaceData, bump: string): Promise<void> {
    await run(`bun pm version ${bump}`, { cwd: workspace.root });
    log.success(`Bumped ${colors.cyan(`(${workspace.pkg.name})`)} ${colors.green(workspace.root)}`);
}

async function publishWorkspace(workspace: WorkspaceData): Promise<void> {
    await run(`bun publish --dry-run`, { cwd: workspace.root, pipe: true });
    log.success(`Published ${colors.cyan(`(${workspace.pkg.name})`)} ${colors.green(workspace.root)}`);
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

async function run(command: string, options?: ExecOptions & { pipe?: boolean; }): Promise<string> {
    const child = exec(command, options);

    let output = '';

    if (options?.pipe) {
        child.stdout?.pipe(process.stdout);
        child.stderr?.pipe(process.stderr);
    } else {
        child.stdout?.on('data', chunk => output += chunk.toString());
        child.stderr?.on('data', chunk => output += chunk.toString());
        child.stdin?.end();
    }

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

    return output;
}
