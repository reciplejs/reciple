import type { PackageJson } from '@reciple/utils';
import { cancel, intro, isCancel, multiselect, select, text } from '@clack/prompts';
import { colors } from '@prtty/prtty';
import { glob } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { exec } from 'node:child_process';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../');
const packages: { root: string; pkg: PackageJson; }[] = [];

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

intro(colors.bold().black().bgCyan(` Found ${packages.length} packages to bump. `));

const selected = await multiselect({
    message: 'Select a package to bump',
    options: packages.map(pkg => ({ label: pkg.pkg.name, value: pkg.root }))
});

if (isCancel(selected)) {
    cancel(`Operation cancelled.`);
    process.exit(0);
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

for (const workspace of selected) {
    const child = exec(`bun pm version ${bump}`, {
        cwd: workspace
    });

    child.stdout?.pipe(process.stdout);
    child.stderr?.pipe(process.stderr);

    await new Promise<void>((res, rej) => {
        child.once('error', rej);
        child.once('close', code => {
            if (code) {
                rej(new Error(`Exited with code: ${code}`));
            } else {
                res(void 0);
            }
        });
    });
}
