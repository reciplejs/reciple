import { colors, type PackageManager } from '@reciple/utils';
import type { ConfigReader } from './ConfigReader.js';
import { mkdir, readdir, stat } from 'node:fs/promises';
import { confirm, intro, isCancel, outro, spinner, text, type SpinnerOptions } from '@clack/prompts';
import micromatch from 'micromatch';
import type { CLI } from './CLI.js';
import { RecipleError } from '@reciple/core';
import path from 'node:path';
import { statSync } from 'node:fs';

export class TemplateBuilder {
    private _directory?: string;

    public cli: CLI;
    public typescript: boolean;
    public packageManager: PackageManager;
    public token?: string;
    public defaultAll: boolean;

    public config?: ConfigReader;

    get directory() {
        return this._directory ?? process.cwd();
    }

    constructor(options: TemplateBuilder.Options) {
        this.cli = options.cli;
        this._directory = options.directory;
        this.typescript = options.typescript;
        this.packageManager = options.packageManager;
        this.defaultAll = options.defaultAll ?? false;
        this.token = options.token;
    }

    public async init() {
        intro(colors.bold(colors.black(colors.bgCyan(` ${this.cli.command.name()} v${this.cli.build} `))));
    }

    public async createDirectory(options?: TemplateBuilder.CreateDirectoryOptions) {
        this._directory = options?.directory ?? this.directory;

        if (!this._directory) {
            const dir = await text({
                message: `Enter project directory`,
                placeholder: `Leave empty to use current directory`,
                defaultValue: process.cwd(),
                validate: value => {
                    const dir = path.resolve(value);
                    if (!statSync(dir).isDirectory()) return 'Invalid folder directory';
                }
            });

            if (isCancel(dir)) throw new RecipleError('operation cancelled');
            this._directory = dir;
        }

        const stats = await stat(this.directory).catch(() => undefined);

        if (stats && !stats.isDirectory()) {
            let files = await readdir(this.directory);
                files = micromatch(files, options?.ignoredFiles ?? TemplateBuilder.ignoredDirectoryFiles);

            if (files.length) {
                switch (options?.onNotEmpty) {
                    case 'throw':
                        throw new RecipleError(`directory ${colors.cyan(this.directory)} is not empty`);
                    case 'ignore':
                        return this;
                    default:
                        const overwrite = await confirm({
                            message: `Directory ${colors.cyan(this.directory)} is not empty. Would you like to overwrite?`,
                            active: 'Yes',
                            inactive: 'No',
                            initialValue: false
                        });

                        if (isCancel(overwrite) || !overwrite) throw new RecipleError('operation cancelled');
                        break;
                }
            }
        }

        await mkdir(this.directory, { recursive: true });
        return this;
    }

    public async build() {
        outro(`Project created in ${colors.cyan(this.directory)}`);
    }
}

export namespace TemplateBuilder {
    export interface Options {
        cli: CLI;
        directory?: string;
        typescript: boolean;
        packageManager: PackageManager;
        defaultAll?: boolean;
        token?: string;
    }

    export const ignoredDirectoryFiles = [
        '.*'
    ];

    export interface CreateDirectoryOptions {
        directory?: string;
        ignoredFiles?: string[];
        onNotEmpty?: 'prompt'|'throw'|'ignore';
    }

    export interface SpinnerPromiseOptions<T> {
        indicator?: SpinnerOptions['indicator'];
        promise: Promise<T>;
        message?: string;
        successMessage?: string;
        errorMessage?: string;
    }

    export async function spinnerPromise<T>(options: SpinnerPromiseOptions<T>): Promise<T> {
        const loader = spinner({ indicator: options.indicator });

        return new Promise<T>((resolve, reject) => {

            loader.start(options.message);

            options.promise
                .then((value) => {
                    loader.stop(options.successMessage);
                    resolve(value);
                })
                .catch((error) => {
                    loader.stop(options.errorMessage);
                    reject(error);
                });
        });
    }
}
