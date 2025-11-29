import { colors, PackageJsonBuilder, PackageManager, sortRecordByKey, type PackageJson } from '@reciple/utils';
import { ConfigReader } from '../cli/ConfigReader.js';
import { copyFile, mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { confirm, intro, isCancel, outro, select, text } from '@clack/prompts';
import micromatch from 'micromatch';
import { CLI } from '../cli/CLI.js';
import path from 'node:path';
import { existsSync, statSync } from 'node:fs';
import { NotAnError } from '../NotAnError.js';
import { slug } from 'github-slugger';
import { exec } from 'node:child_process';
import { RecipleError } from '@reciple/core';
import { packageJSON } from '../../helpers/constants.js';
import { parse as parseDotenv } from '@dotenvx/dotenvx';
import { RuntimeEnvironment } from '../cli/RuntimeEnvironment.js';
import { ModuleTemplateBuilder } from './ModuleTemplateBuilder.js';

export class TemplateBuilder {
    private _directory?: string;
    private _packageManager?: PackageManager;

    public cli: CLI;
    public typescript?: boolean;
    public token?: string;
    public defaultAll: boolean;

    public config?: ConfigReader;
    public packageJson?: PackageJsonBuilder;

    public isPackageManagerInstalled = false;

    get directory() {
        return this._directory ?? process.cwd();
    }

    get packageManager() {
        return this._packageManager ?? new PackageManager(PackageManager.getNPMUserAgent() ?? undefined);
    }

    get relativeDirectory() {
        return path.relative(process.cwd(), this.directory) || './';
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
        intro(colors.bold(colors.black(colors.bgCyan(` ${this.cli.command.name()} create - v${this.cli.build} `))));
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
            filepath = await ConfigReader.findConfig(
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

        const exists = await ConfigReader.hasFile(filepath);

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
        const globals = path.join(CLI.root, './assets/global/');
        const modulesDirectory = path.join(this.directory, 'src');
        const moduleTemplates = await ModuleTemplateBuilder.resolveModuleTemplates(this.typescript ? 'ts' : 'js');
        const moduleOptions = {
            cli: this.cli,
            config: this.config!,
            defaultAll: true,
            typescript: this.typescript,
        };

        function rename(data: TemplateBuilder.CopyMetadata) {
            switch (data.basename) {
                case 'gitignore':
                    return '.gitignore';
                default:
                    return options?.rename?.(data) ?? data.basename;
            }
        }

        function overwrite(data: TemplateBuilder.CopyMetadata) {
            switch (data.basename) {
                case 'gitignore':
                    return false;
                case 'tsconfig.json':
                case 'jsconfig.json':
                    return true;
                default:
                    return (typeof options?.overwrite === 'boolean' ? options.overwrite : options?.overwrite?.(data)) ?? true;
            }
        }

        const [template, loader] = CLI.createSpinnerPromise({
            promise: Promise.all([
                TemplateBuilder.copy(source, this.directory, { ...options, rename, overwrite }),
                TemplateBuilder.copy(globals, this.directory, { ...options, rename, overwrite }),
                new ModuleTemplateBuilder({
                        ...moduleOptions,
                        directory: path.join(modulesDirectory, 'commands'),
                        filename: `SlashCommand.${this.typescript ? 'ts' : 'js'}`,
                        template: moduleTemplates.find(t => t.name === 'SlashCommand')
                    })
                    .setupPlaceholders()
                    .then(m => m.build({ silent: true })),
                new ModuleTemplateBuilder({
                        ...moduleOptions,
                        directory: path.join(modulesDirectory, 'events'),
                        filename: `ClientEvent.${this.typescript ? 'ts' : 'js'}`,
                        template: moduleTemplates.find(t => t.name === 'ClientEvent')
                    })
                    .setupPlaceholders()
                    .then(m => m.build({ silent: true }))
            ]),
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

        if (!this._packageManager) {
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

            switch (npmUserAgent) {
                case 'npm':
                case 'yarn':
                case 'pnpm':
                case 'bun':
                case 'deno':
            }
        }

        const dependencyRecord = TemplateBuilder.createDependencyRecord(this.typescript ? 'ts' : 'js');

        this.packageJson = await PackageJsonBuilder.read(this.packageJsonPath);
        this.packageJson.merge({
            name: this.name,
            version: '0.0.1',
            type: 'module',
            scripts: {
                build: `reciple build`,
                start: 'reciple start',
                dev: 'nodemon',
            },
            dependencies: dependencyRecord.dependencies,
            devDependencies: dependencyRecord.devDependencies,
            private: true
        });

        return this;
    }

    public async checkInstalledPackageManager(): Promise<this> {
        this.isPackageManagerInstalled = await RuntimeEnvironment.isInstalled(this.packageManager.type);
        if (this.isPackageManagerInstalled) return this;

        const skip = await confirm({
            message: `Package manager ${colors.bold(colors.cyan(this.packageManager.type))} is not installed, would you like to continue?`,
            initialValue: false,
            active: 'Yes',
            inactive: 'No'
        });

        if (isCancel(skip)) throw new NotAnError('Operation cancelled');
        if (!skip) throw new NotAnError(`Package manager ${colors.bold(colors.cyan(this.packageManager.type))} is not installed`);

        return this;
    }

    public async createEnvFile(options?: TemplateBuilder.CreateEnvFileOptions): Promise<this> {
        const tokenKey = options?.tokenKey ?? 'DISCORD_TOKEN';
        const envFile = options?.envFile ? path.resolve(options.envFile) : path.join(this.directory, '.env');
        const stats = await stat(envFile).catch(() => undefined);

        let env = options?.env ?? {};
            env = stats
                ? parseDotenv(await readFile(envFile, 'utf-8'), {
                    processEnv: env
                })
                : env;

        if (env[tokenKey]) {
            const skip = this.defaultAll || await confirm({
                message: 'Discord bot token already exists in .env file, do you want to skip?',
                initialValue: true,
                active: 'Yes',
                inactive: 'No'
            });

            if (isCancel(skip)) throw new NotAnError('Operation cancelled');
            if (skip) return this;
        }

        const token = await text({
            message: 'Enter Discord Bot Token',
            placeholder: 'Bot Token from Discord Developer Portal',
            defaultValue: env[tokenKey]
        });

        if (isCancel(token)) throw new NotAnError('Operation cancelled');
        env[tokenKey] = token;

        await writeFile(envFile, `\n${tokenKey}="${token}"\n`, {
            encoding: 'utf-8',
            flag: 'a'
        });

        return this;
    }

    public async build(): Promise<this> {
        await this.packageJson?.write(this.packageJsonPath, true);

        if (this.isPackageManagerInstalled) {
            await this.runCommand(this.packageManager.installAll());
            await this.runCommand(this.packageManager.run('build'));
        }

        outro(`Project created in ${colors.cyan(this.relativeDirectory)}`);

        console.log(`\n${colors.bold(colors.green('✔'))} Start developing:`);

        if (this.relativeDirectory !== './') {
            console.log(`  • ${colors.cyan(colors.bold(`cd ${this.relativeDirectory}`))}`);
        }

        if (!this.isPackageManagerInstalled) {
            console.log(`  • ${colors.cyan(colors.bold(this.packageManager.installAll()))}`);
        }

        console.log(`  • ${colors.cyan(colors.bold(this.packageManager.run('build')))} ${colors.dim('(Build)')}`);
        console.log(`  • ${colors.cyan(colors.bold(this.packageManager.run('dev')))} ${colors.dim('(Development)')}`);
        console.log(`  • ${colors.cyan(colors.bold(this.packageManager.run('start')))} ${colors.dim('(Production)')}`);


        return this;
    }

    public async runCommand(command: string, options?: TemplateBuilder.RunCommandOptions & Omit<CLI.SpinnerPromiseOptions<void>, 'promise'>): Promise<TemplateBuilder.RunCommandResult> {
        const result = CLI.createSpinnerPromise({
            indicator: 'timer',
            ...options,
            message: `$ ${colors.green(command)}`,
            successMessage: `${colors.bold(colors.green('✓'))} ${colors.green(command)}`,
            errorMessage: `${colors.bold(colors.red('✗'))} ${colors.red(command)}`,
            promise: TemplateBuilder.runCommand(command, {
                cwd: this.directory,
                ...options
            })
        });

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

    export const ignoredDirectoryFiles = ['.*', 'LICENSE'];

    export const dependencies: Record<'ts'|'js'|'both', Partial<Record<'dependencies'|'devDependencies', PackageJson.Dependency>>> = {
        both: {
            dependencies: {
                // TODO: Uncomment when ready
                // '@reciple/core': packageJSON.dependencies?.['@reciple/core'],
                '@reciple/jsx': packageJSON.dependencies?.['@reciple/jsx'],
                // 'reciple': `^${packageJSON.version}`,
            },
            devDependencies: {
                '@types/node': packageJSON.devDependencies?.['@types/node'],
                nodemon: packageJSON.devDependencies?.nodemon
            }
        },
        ts: {},
        js: {}
    };

    export function createDependencyRecord(type: 'ts'|'js'): Partial<Record<'dependencies'|'devDependencies', PackageJson.Dependency>> {
        const record = type === 'ts'
            ? dependencies.ts
            : type === 'js'
                ? dependencies.js
                : {};

        record.dependencies = sortRecordByKey({ ...record.dependencies, ...dependencies.both.dependencies });
        record.devDependencies = sortRecordByKey({ ...record.devDependencies, ...dependencies.both.devDependencies });

        return record;
    }

    export interface CreateDirectoryOptions {
        directory?: string;
        ignoredFiles?: string[];
        onNotEmpty?: 'prompt'|'throw'|'ignore';
    }

    export interface SetupLanguageOptions {
        typescript?: boolean;
    }

    export interface CreateConfigOptions extends Partial<ConfigReader.CreateOptions> {}

    export interface CreateModulesOptions extends Partial<CopyOptions> {}

    export interface CreatePackageManagerOptions {
        packageManager?: PackageManager|PackageManager.Type;
    }

    export interface CreateEnvFileOptions {
        envFile?: string;
        tokenKey?: string;
        env?: Record<string, string>;
    }

    export interface CopyOptions {
        overwrite?: boolean|((data: CopyMetadata) => boolean);
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
                    src: path.join(from, file),
                    dest: to
                };

                await copy(
                    data.src,
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
        const overwrite = typeof options?.overwrite === 'function'
            ? options.overwrite(data)
            : options?.overwrite ?? true;

        if (toStats && overwrite) return;

        await mkdir(path.dirname(to), { recursive: true });
        await copyFile(from, to);
    }

    export interface RunCommandOptions {
        cwd?: string;
        env?: NodeJS.ProcessEnv;
        onOutput?: (data: string) => void;
    }

    export interface RunCommandResult {
        output: string;
        lastOutput: string;
    }

    export function runCommand(command: string, options?: RunCommandOptions): Promise<RunCommandResult> {
        let lastOutput = '';
        let output = '';

        const child = exec(command, {
            cwd: options?.cwd,
            env: options?.env
        });

        const onOutput = (data: any) => {
            lastOutput = String(data).trim();
            output += `\n${lastOutput}`;

            return options?.onOutput?.(lastOutput);
        }

        return new Promise((resolve, reject) => {
            const onExit = (code: number|null) => code === 0
                ? resolve({ output, lastOutput })
                : reject(new RecipleError({
                    message: `Command exited "${command}" with code ${colors.red(code?.toString() ?? 'unknown')}`,
                    name: 'CommandError',
                    cause: output
                }));

            child.on('exit', onExit);
            child.on('error', error => reject(error));

            child.stdout?.on('data', onOutput);
            child.stderr?.on('data', onOutput);
        });
    }
}
