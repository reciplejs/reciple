import { colors, PackageJsonBuilder } from '@reciple/utils';
import { ConfigReader } from '../cli/ConfigReader.js';
import { copyFile, mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { confirm, intro, isCancel, outro, select, text } from '@clack/prompts';
import micromatch from 'micromatch';
import { CLI } from '../cli/CLI.js';
import path from 'node:path';
import { existsSync, statSync } from 'node:fs';
import { NotAnError } from '../NotAnError.js';
import { slug } from 'github-slugger';
import { packageJSON } from '../../helpers/constants.js';
import { parse as parseDotenv } from '@dotenvx/dotenvx';
import { ModuleTemplateBuilder } from './ModuleTemplateBuilder.js';
import { detectPackageManager, installDependencies, installDependenciesCommand, runScript, runScriptCommand, type PackageManagerName } from 'nypm';

export class TemplateBuilder {
    private _directory?: string;

    public cli: CLI;
    public typescript?: boolean;
    public token?: string;
    public defaultAll: boolean;

    public config?: ConfigReader;
    public packageJson?: PackageJsonBuilder;

    public packageManager?: PackageManagerName;

    get directory() {
        return this._directory ?? process.cwd();
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
        this.defaultAll = options.defaultAll ?? false;
        this.packageManager = options.packageManager;
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
        const moduleOptions: ModuleTemplateBuilder.Options = {
            cli: this.cli,
            config: await ConfigReader.getDefault(this.typescript ? 'ts' : 'js'),
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

    public async setPackageManager(options?: TemplateBuilder.SetPackageManagerOptions) {
        this.packageManager = options?.packageManager ?? this.packageManager;

        if (!this.packageManager) {
            const defaultPackageManager = await detectPackageManager(this.directory).then(pm => pm?.name ?? 'npm');
            const packageManager: PackageManagerName|symbol = this.defaultAll
                ? defaultPackageManager
                : await select({
                    message: 'Select package manager',
                    options: [
                        { value: defaultPackageManager, label: defaultPackageManager },
                        ...[
                            { value: 'npm', label: 'npm' },
                            { value: 'yarn', label: 'yarn' },
                            { value: 'pnpm', label: 'pnpm' },
                            { value: 'bun', label: 'bun' },
                            { value: 'deno', label: 'deno' }
                        ].filter(o => o.value !== defaultPackageManager) as { value: PackageManagerName; label: string; }[]
                    ],
                    initialValue: defaultPackageManager
                });

            if (isCancel(packageManager)) throw new NotAnError('Operation cancelled');
            this.packageManager = packageManager;
        }

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
            ...TemplateBuilder.createDependencyRecord(this.typescript ? 'ts' : 'js'),
            private: true
        });

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

    public async build(options?: TemplateBuilder.BuildOptions): Promise<this> {
        await this.packageJson?.write(this.packageJsonPath, true);

        if (options?.skipInstall) await CLI.createSpinnerPromise({
            promise: installDependencies({
                cwd: this.directory,
                packageManager: this.packageManager,
                silent: true
            }),
            indicator: 'timer',
            errorMessage: `${colors.bold(colors.red('✗'))} Failed to install dependencies`,
            successMessage: `${colors.bold(colors.green('✔'))} Dependencies installed successfully`,
            message: `${colors.bold(colors.dim('$'))} Installing dependencies`
        })[0];

        if (!options?.skipBuild) await CLI.createSpinnerPromise({
            promise: runScript('build', {
                cwd: this.directory,
                packageManager: this.packageManager,
                silent: true
            }),
            indicator: 'timer',
            errorMessage: `${colors.bold(colors.red('✗'))} Failed to build project`,
            successMessage: `${colors.bold(colors.green('✔'))} Project built successfully`,
            message: `${colors.bold(colors.dim('$'))} Building project`
        })[0];

        outro(`Project created in ${colors.cyan(this.relativeDirectory)}`);

        console.log(`\n${colors.bold(colors.green('✔'))} Start developing:`);

        if (this.relativeDirectory !== './') {
            console.log(`  • ${colors.cyan(colors.bold(`cd ${this.relativeDirectory}`))}`);
        }

        console.log(`  • ${colors.cyan(colors.bold(installDependenciesCommand(this.packageManager ?? 'npm')))} ${colors.dim('(Install dependencies)')}`);
        console.log(`  • ${colors.cyan(colors.bold(runScriptCommand(this.packageManager ?? 'npm', 'build')))} ${colors.dim('(Build)')}`);
        console.log(`  • ${colors.cyan(colors.bold(runScriptCommand(this.packageManager ?? 'npm', 'dev')))} ${colors.dim('(Development)')}`);
        console.log(`  • ${colors.cyan(colors.bold(runScriptCommand(this.packageManager ?? 'npm', 'start')))} ${colors.dim('(Production)')}`);


        return this;
    }
}

export namespace TemplateBuilder {
    export interface Options {
        cli: CLI;
        directory?: string;
        typescript?: boolean;
        packageManager?: PackageManagerName;
        defaultAll?: boolean;
        token?: string;
    }

    export const ignoredDirectoryFiles = ['.*', 'LICENSE'];

    export const dependencies: Record<'ts'|'js'|'both', Partial<Record<'dependencies'|'devDependencies', Record<string, string>>>> = {
        both: {
            dependencies: {
                '@reciple/core': packageJSON.dependencies?.['@reciple/core']!,
                '@reciple/jsx': packageJSON.dependencies?.['@reciple/jsx']!,
                'reciple': `^${packageJSON.version}`,
            },
            devDependencies: {
                '@types/node': packageJSON.devDependencies?.['@types/node']!,
                nodemon: packageJSON.devDependencies?.nodemon!
            }
        },
        ts: {},
        js: {}
    };

    export function createDependencyRecord(type: 'ts'|'js'): Partial<Record<'dependencies'|'devDependencies', Record<string, string>>> {
        const record = type === 'ts'
            ? dependencies.ts
            : type === 'js'
                ? dependencies.js
                : {};

        record.dependencies = { ...record.dependencies, ...dependencies.both.dependencies };
        record.devDependencies = { ...record.devDependencies, ...dependencies.both.devDependencies };

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

    export interface SetPackageManagerOptions {
        packageManager?: PackageManagerName;
    }

    export interface CreateEnvFileOptions {
        envFile?: string;
        tokenKey?: string;
        env?: Record<string, string>;
    }

    export interface BuildOptions {
        skipInstall?: boolean;
        skipBuild?: boolean;
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
}
