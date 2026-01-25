import { execSync } from 'node:child_process';

export async function getGitRef() {
    const child = execSync(`git rev-parse HEAD`);
    return child.toString().trim();
}

export async function getGitRemote(removeDotGit: boolean = true) {
    const child = execSync(`git config --get remote.origin.url`);
    const remote = child.toString().trim();

    return remote.endsWith('.git') && removeDotGit ? remote.slice(0, -4) : remote;
}
