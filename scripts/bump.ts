import { cancel, confirm, intro, isCancel, log, multiselect, outro, select, text } from '@clack/prompts';
import { colors } from '@prtty/prtty';
import { findWorkspaceDependents, resolveWorkspaces, type WorkspaceData } from './workspaces.js';
import { run } from './utils/run.js';

//#region Select workspaces
const workspaces: WorkspaceData[] = await resolveWorkspaces();

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

//#endregion
//#region Get version increment

let bump: string|null|symbol = await select({
    message: 'Select a version increment type',
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

//#endregion
//#region Perform bump

for (const dir of selected) {
    const workspace = workspaces.find(p => p.root === dir);
    if (!workspace) continue;

    await run(`bun pm version ${bump}`, { cwd: workspace.root });
    log.success(`Bumped ${colors.cyan(`(${workspace.pkg.name})`)} ${colors.green(workspace.root)}`);
}

//#endregion
//#region Publish packages

const publish = await confirm({
    message: 'Would you like to publish?',
    initialValue: true
});

if (publish === true) {
    for (const workspace of workspaces) {
        await run(`bun publish --dry-run`, { cwd: workspace.root, pipe: true });
        log.success(`Published ${colors.cyan(`(${workspace.pkg.name})`)} ${colors.green(workspace.root)}`);
    }
}

//#endregion
//#region Done

outro(`${colors.bold().green('✔')} Finished!`);

//#endregion
