#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { CLI } from 'reciple';

spawn(process.execPath, [CLI.bin, 'create', ...process.argv.slice(2)], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit'
});
