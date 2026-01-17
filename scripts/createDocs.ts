import { spawn } from "node:child_process";
import { mkdir, readdir, stat, rm, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.join(import.meta.dirname, '../');
const packages = await readdir(path.join(root, "./packages"));
const outDir = path.join(root, './docs');

await new Promise((res, rej) => {
    const child = spawn(`turbo run docs`, {
        env: process.env,
        shell: true,
        stdio: 'inherit'
    });

    child.once('error', rej);
    child.once('exit', code => {
        if (code) {
            rej(new Error(`Exited with code: ${code}`));
        } else {
            res(void 0);
        }
    });
});

for (const pkg of packages) {
    const entry = path.join("./packages", pkg, "docs.json");
    const newDir = path.join(outDir, pkg);

    const exists = await stat(entry).then(r => r.isFile()).catch(() => false);
    if (!exists) continue;

    const data = await readFile(entry, 'utf-8').then(data => data.replaceAll(`file://${path.join(root, 'packages/')}`, './'));

    await rm(entry);
    await mkdir(newDir, { recursive: true });
    await writeFile(path.join(newDir, 'docs.json'), data);
}
