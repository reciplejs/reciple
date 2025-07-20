#!/usr/bin/env node
import { fork } from 'node:child_process';
import { CLI } from 'reciple';

fork(CLI.bin, ['create', ...process.argv.slice(2)], {
    stdio: 'inherit'
});
