import { colors, PackageJsonBuilder, PackageManager } from '@reciple/utils';
import { ConfigReader } from './ConfigReader.js';
import { copyFile, mkdir, readdir, stat } from 'node:fs/promises';
import { confirm, intro, isCancel, outro, select, spinner, text, type SpinnerOptions } from '@clack/prompts';
import micromatch from 'micromatch';
import { CLI } from './CLI.js';
import path from 'node:path';
import { existsSync, statSync } from 'node:fs';
import { NotAnError } from './NotAnError.js';
import { slug } from 'github-slugger';
import { exec } from 'node:child_process';
import { RecipleError } from '@reciple/core';

export class TemplateBuilder {
    private _directory?: string;
    private _packageManager?: PackageManager;

    public cli: CLI;
    public typescript?: boolean;
    public token?: string;
    public defaultAll: boolean;

    public config?: ConfigReader;
    public packageJson?: PackageJsonBuilder;

    get directory() {
        return this._directory ?? process.cwd();
    }

    get packageManager() {
        return this._packageManager ?? new PackageManager(PackageManager.getNPMUserAgent() ?? undefined);
    }

    get relativeDirectory() {
        return path.relative(process.cwd(), this.directory) || '.';
    }

    get packageJsonPath() {
        return path.join(this.directory, 'package.json');
    }

    get name() {
        return slug(path.basename(this.directory));
    }

    constructor(options: TemplateBuilder.Options) {
        this.cli = options.cli;
        this._directory = options.directory;
        this.typescript = options.typescript;
        this._packageManager = options.packageManager;
        this.defaultAll = options.defaultAll ?? false;
        this.token = options.token;
    }

    public async init(): Promise<this> {
        intro(colors.bold(colors.black(colors.bgCyan(` ${this.cli.command.name()} v${this.cli.build} `))));
        return this;
    }

    public async createDirectory(options?: TemplateBuilder.CreateDirectoryOptions): Promise<this> {
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

        if (stats) {
            let files = await readdir(this.directory);
                files = micromatch.not(files, options?.ignoredFiles ?? TemplateBuilder.ignoredDirectoryFiles, { dot: true });

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

    public async setupLanguage(options?: TemplateBuilder.SetupLanguageOptions): Promise<this> {
        this.typescript = options?.typescript ?? this.typescript;

        if (!this.typescript) {
            const isTypeScript = this.defaultAll
                ? false
                : await confirm({
                    message: 'Would you like to use TypeScript?',
                    active: 'Yes',
                    inactive: 'No',
                    initialValue: false
                });

            if (isCancel(isTypeScript)) throw new NotAnError('Operation cancelled');
            this.typescript = isTypeScript;
        }

        return this;
    }

    public async createConfig(options?: TemplateBuilder.CreateConfigOptions): Promise<this> {
        let filepath = options?.filepath;

        if (!filepath) {
            filepath = await ConfigReader.findConfigFromDirectory(
                    this.directory,
                    this.typescript
                        ? 'ts'
                        : this.typescript === false
                            ? 'js'
                            : undefined
                )
                ?? path.join(
                    this.directory,
                    ConfigReader.createConfigFilename(this.typescript ? 'ts' : 'js')
                );
        }

        const exists = await ConfigReader.hasConfigFile(filepath);

        if (exists) {
            const overwrite = this.defaultAll
                ? false
                : await confirm({
                    message: `Config file already exists at ${colors.green(path.relative(process.cwd(), filepath))}. Would you like to overwrite it?`,
                    active: 'Yes',
                    inactive: 'No',
                    initialValue: false
                });

            if (!overwrite) return this;
            if (isCancel(overwrite)) throw new NotAnError('Operation cancelled');
        }

        this.config = await ConfigReader.create({
            ...options,
            filepath,
            type: this.typescript ? 'ts' : 'js',
            overwrite: true
        });

        return this;
    }

    public async createTemplate(options?: TemplateBuilder.CreateModulesOptions): Promise<this> {
        const source = path.join(CLI.root, './assets/templates/', this.typescript ? 'typescript' : 'javascript');

        const [template, loader] = TemplateBuilder.createSpinnerPromise({
            promise: TemplateBuilder.copy(source, this.directory, options),
            message: 'Copying template files',
            successMessage: 'Files copied successfully',
            errorMessage: 'Failed to copy files'
        });

        await template;
        return this;
    }

    public async createPackageManager(options?: TemplateBuilder.CreatePackageManagerOptions) {
        this._packageManager = options?.packageManager instanceof PackageManager
            ? options.packageManager
            : options?.packageManager && new PackageManager(options?.packageManager);

        if (!this.packageManager) {
            const defaultNpmUserAgent = PackageManager.getNPMUserAgent() ?? 'npm';
            const npmUserAgent: PackageManager.Type|symbol = this.defaultAll
                ? defaultNpmUserAgent
                : await select({
                    message: 'Select package manager',
                    options: [
                        { value: defaultNpmUserAgent, label: defaultNpmUserAgent },
                        ...[
                            { value: 'npm', label: 'npm' },
                            { value: 'yarn', label: 'yarn' },
                            { value: 'pnpm', label: 'pnpm' },
                            { value: 'bun', label: 'bun' },
                            { value: 'deno', label: 'deno' }
                        ].filter(o => o.value !== defaultNpmUserAgent) as { value: PackageManager.Type; label: string; }[]
                    ],
                    initialValue: defaultNpmUserAgent
                });

            if (isCancel(npmUserAgent)) throw new NotAnError('Operation cancelled');
            this._packageManager = new PackageManager(npmUserAgent);
        }

        this.packageJson = await PackageJsonBuilder.read(this.packageJsonPath);

        this.packageJson.merge({
            name: this.name,
            version: '0.0.1',
            type: 'module',
            private: true
        });

        await this.packageJson.write(this.packageJsonPath, true);

        return this;
    }

    public async build(): Promise<this> {
        await mkdir(this.directory, { recursive: true });
        await this.runCommand(this.packageManager.installAll());

        outro(`Project created in ${colors.cyan(this.directory)}`);
        return this;
    }

    public async runCommand(command: string, options?: TemplateBuilder.RunCommandOptions & Omit<TemplateBuilder.SpinnerPromiseOptions<void>, 'promise'>): Promise<void> {
        const result = TemplateBuilder.createSpinnerPromise({
            ...options,
            message: `$ ${colors.green(command)}`,
            successMessage: `${colors.bold(colors.green('✓'))} ${colors.green(command)}`,
            errorMessage: `${colors.bold(colors.red('✗'))} ${colors.red(command)}`,
            promise: TemplateBuilder.runCommand(command, {
                cwd: this.directory,
                ...options,
                onOutput
            })
        });

        function onOutput(data: string) {
            if (options?.onOutput) options.onOutput(data);
            if (result[1]) result[1].message(data);
        };

        return result[0];
    }
}

export namespace TemplateBuilder {
    export interface Options {
        cli: CLI;
        directory?: string;
        typescript?: boolean;
        packageManager?: PackageManager;
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

    export interface SetupLanguageOptions {
        typescript?: boolean;
    }

    export interface CreateConfigOptions extends Partial<ConfigReader.CreateOptions> {}

    export interface CreateModulesOptions {}

    export interface CreatePackageManagerOptions {
        packageManager?: PackageManager|PackageManager.Type;
    }

    export interface SpinnerPromiseOptions<T> {
        indicator?: SpinnerOptions['indicator'];
        promise: Promise<T>;
        message?: string;
        successMessage?: string;
        errorMessage?: string;
    }

    export function createSpinnerPromise<T>(options: SpinnerPromiseOptions<T>): [Promise<T>, ReturnType<typeof spinner>] {
        const loader = spinner({ indicator: options.indicator });

        return [
            new Promise<T>((resolve, reject) => {
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
            }),
            loader
        ];
    }

    export interface CopyOptions {
        overwrite?: boolean;
        filter?: (data: CopyMetadata) => boolean;
        rename?: (data: CopyMetadata) => string;
    }

    export interface CopyMetadata {
        basename: string;
        src: string;
        dest: string;
    }

    export async function copy(from: string, to: string, options?: CopyOptions): Promise<void> {
        const fromStats = await stat(from).catch(() => undefined);
        if (!fromStats) return;

        if (fromStats.isDirectory()) {
            const files = await readdir(from);

            for (const file of files) {
                const data: CopyMetadata = {
                    basename: file,
                    src: from,
                    dest: to
                };

                if (options?.filter && !options.filter(data)) continue;

                await copy(
                    path.join(from, file),
                    path.join(to,
                        options?.rename
                            ? options.rename(data)
                            : file
                    ),
                    options
                );
            }
            return;
        }

        const data: CopyMetadata = {
            basename: path.basename(from),
            src: from,
            dest: to
        };

        if (options?.filter && !options.filter(data)) return;

        const toStats = await stat(to).catch(() => undefined);
        if (toStats && options?.overwrite === false) return;

        await mkdir(path.dirname(to), { recursive: true });
        await copyFile(from, to);
    }

    export interface RunCommandOptions {
        cwd?: string;
        env?: NodeJS.ProcessEnv;
        onOutput?: (data: string) => void;
    }

    export function runCommand(command: string, options?: RunCommandOptions): Promise<void> {
        const child = exec(command, {
            cwd: options?.cwd,
            env: options?.env
        });

        return new Promise((resolve, reject) => {
            const onExit = (code: number|null) => code === 0 ? resolve() : reject(new RecipleError(`Command exited "${command}" with code ${colors.red(code?.toString() ?? 'unknown')}`));

            child.on('exit', onExit);
            child.on('error', error => reject(error));

            child.stdout?.on('data', data => options?.onOutput?.(String(data).trim()));
            child.stderr?.on('data', data => options?.onOutput?.(String(data).trim()));
        });
    }
}
