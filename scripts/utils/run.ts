import { exec, type ExecOptions } from 'node:child_process';

export async function run(command: string, options?: ExecOptions & { pipe?: boolean; }): Promise<string> {
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
