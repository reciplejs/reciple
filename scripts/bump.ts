import { cancel, confirm, intro, isCancel, log, multiselect, outro, select, text } from '@clack/prompts';
import { colors } from '@prtty/prtty';
import { findWorkspaceDependents, resolveWorkspaces, root, type WorkspaceData } from './utils/workspaces.js';
import path from 'node:path';
import { execSync } from 'node:child_process';

//#region Select workspaces
const workspaces: WorkspaceData[] = await resolveWorkspaces();
const dryRun = process.argv.includes('--dry-run');

intro(colors.bold().black().bgCyan(` Found ${workspaces.length} packages `));

const selected = await multiselect({
    message: 'Select a package to bump',
    options: workspaces.map(pkg => ({ label: pkg.pkg.name, value: pkg.root }))
});

if (isCancel(selected)) {
    cancel(`Operation cancelled.`);
    process.exit(0);
}

const dependents = selected
    .map(dir => workspaces.find(p => p.root === dir)!)
    .flatMap(p => p ? findWorkspaceDependents(p.pkg.name, workspaces) : [])
    .filter(p => !selected.includes(p.root))
    .filter((p, i, arr) => arr.indexOf(p) === i);

if (dependents.length) {
    const selectedDependents = await multiselect({
        message: 'Dependents that will also be bumped',
        required: false,
        initialValues: dependents.map(p => p.root),
        options: dependents.map(pkg => ({ label: pkg.pkg.name, value: pkg.root }))
    });

    if (isCancel(selectedDependents)) {
        cancel(`Operation cancelled.`);
        process.exit(0);
    }

    selected.push(...selectedDependents);
}

//#endregion
//#region Get version increment

let bump: string|null|symbol = await select({
    message: 'Select a version increment type',
    options: [
        { label: 'Patch', value: 'patch' },
        { label: 'Minor', value: 'minor' },
        { label: 'Major', value: 'major' },
        { label: 'Pre-patch', value: 'prepatch' },
        { label: 'Pre-minor', value: 'preminor' },
        { label: 'Pre-major', value: 'premajor' },
        { label: 'Pre-release', value: 'prerelease' },
        { label: 'From git', value: 'from-git' },
        { label: 'Custom', value: null },
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

const preid = bump.startsWith('pre') ? await text({ message: 'Enter a preid (left empty for none)', initialValue: '' }) : null;

if (isCancel(preid)) {
    cancel(`Operation cancelled.`);
    process.exit(0);
}

//#endregion
//#region Perform bump

for (const dir of selected) {
    const workspace = workspaces.find(p => p.root === dir);
    if (!workspace) continue;

    let command = `bun pm version ${bump} --no-git-tag-version`;

    if (preid) command += ` --preid ${preid}`;

    execSync(command, { cwd: workspace.root, stdio: 'ignore' });
    log.success(`Bumped ${colors.cyan(`(${workspace.pkg.name})`)} ${colors.green(workspace.root)}`);
}

//#endregion
//#region Publish packages

const publish = await confirm({
    message: 'Would you like to publish?',
    initialValue: true
});

if (isCancel(publish)) {
    cancel(`Operation cancelled.`);
    process.exit(0);
}

outro(colors.bold().green(publish ? `Publishing ${selected.length} packages.` : `Successfully bumped ${selected.length} packages.`));
console.log();

if (publish) for (const dir of selected) {
    const workspace = workspaces.find(p => p.root === dir);
    if (!workspace) continue;

    execSync(`bun publish ${dryRun ? '--dry-run' : ''}`, { cwd: workspace.root, stdio: 'inherit' });
    console.log(`Published ${colors.cyan(`(${workspace.pkg.name})`)} ${colors.green(workspace.root)}`);
}

//#endregion
//#region Perform git operations

const newWorkspaces = (await resolveWorkspaces()).filter(w => selected.includes(w.root));
const tags = [];

for (const workspace of newWorkspaces) {
    tags.push(`${workspace.pkg.name}@${workspace.pkg.version}`);

    execSync(`git add ${path.join(workspace.root, 'package.json')} ${dryRun ? '--dry-run' : ''}`, { cwd: root, stdio: 'ignore' });
}

execSync(`git commit -m "chore: bump ${bump}" ${dryRun ? '--dry-run' : ''}`, { cwd: root, stdio: 'ignore' });

for (const tag of tags) {
    try {
        execSync(`git tag ${tag} ${dryRun ? '--dry-run' : ''}`, { cwd: root, stdio: 'ignore' });
    } catch (e) {
        console.log(colors.red(`An error occurred while tagging ${tag}: ${e}`));
    }
}

//#endregion
