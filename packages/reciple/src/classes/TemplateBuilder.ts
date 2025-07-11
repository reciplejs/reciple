import { colors, type PackageManager } from '@reciple/utils';
import type { ConfigReader } from './ConfigReader.js';
import { mkdir, readdir, stat } from 'node:fs/promises';
import { confirm, intro, isCancel, outro, spinner, text, type SpinnerOptions } from '@clack/prompts';
import micromatch from 'micromatch';
import type { CLI } from './CLI.js';
import path from 'node:path';
import { existsSync, statSync } from 'node:fs';
import { NotAnError } from './NotAnError.js';

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

    get relativeDirectory() {
        return path.relative(process.cwd(), this.directory) || '.';
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
        this._directory = options?.directory ?? this._directory;

        if (!this._directory) {
            const dir = this.defaultAll
                ? process.cwd()
                : await text({
                    message: `Enter project directory`,
                    placeholder: `Leave empty to use current directory`,
                    defaultValue: process.cwd(),
                    validate: value => {
                        const dir = path.resolve(value);
                        if (existsSync(dir) && !statSync(dir).isDirectory()) return 'Invalid folder directory';
                    }
                });

            if (isCancel(dir)) throw new NotAnError('Operation cancelled');
            this._directory = dir;
        }

        this._directory = path.resolve(this._directory);

        const stats = await stat(this.directory).catch(() => undefined);

        if (stats && stats.isDirectory()) {
            let files = await readdir(this.directory);
                files = files.filter(f => !micromatch.isMatch(f, options?.ignoredFiles ?? TemplateBuilder.ignoredDirectoryFiles, { dot: true }));

            if (files.length) {
                switch (options?.onNotEmpty) {
                    case 'throw':
                        throw new NotAnError(`Directory ${colors.cyan(this.relativeDirectory)} is not empty`);
                    case 'ignore':
                        return this;
                    default:
                        const overwrite = this.defaultAll
                            ? false
                            : await confirm({
                                message: `Directory ${colors.cyan(this.relativeDirectory)} is not empty. Would you like to continue?`,
                                active: 'Yes',
                                inactive: 'No',
                                initialValue: false
                            });

                        if (!overwrite) throw new NotAnError(`Directory ${colors.cyan(this.relativeDirectory)} is not empty`);
                        if (isCancel(overwrite)) throw new NotAnError('Operation cancelled');
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
