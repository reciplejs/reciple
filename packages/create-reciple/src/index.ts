#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { styleText } from 'node:util';
import { CLI } from 'reciple';

useLogger().warn(`This command is now obsolete. Please use ${styleText(['bold', 'yellow'], 'reciple create')} instead.`);

spawn(process.execPath || 'node', [CLI.bin, 'create', ...process.argv.slice(2)], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit'
});
