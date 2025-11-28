import { Command } from 'commander';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { coerce } from 'semver';
import { colors, Format, isDebugging, recursiveDefaults } from '@reciple/utils';
import { logger, Logger, type LoggerOptions } from 'prtyprnt';
import { config as loadEnv } from '@dotenvx/dotenvx';
import { readdir, stat } from 'node:fs/promises';
import { CLISubcommand } from './CLISubcommand.js';
import { spinner, type SpinnerOptions } from '@clack/prompts';
import type { RolldownPlugin } from 'rolldown';

export class CLI {
    public build: string;
    public version: string;
    public command: Command;
    public logger: Logger;

    get isDebugging(): boolean {
        return this.flags.debug;
    }

    get flags(): CLI.Flags {
        return this.command.opts();
    }

    constructor(public readonly options: CLI.Options) {
        this.build = options.build;
        this.version = String(coerce(this.build) ?? this.build);

        this.command = new Command()
            .name(options.name)
            .description(options.description)
            .version(options.build, '-v, --version', 'Output the CLI version number')
            .option('-D, --debug', 'Enable debug mode', isDebugging())
            .option('--env <file>', 'Load environment variables from .env file',  (v, p) => p.concat(v), [] as string[])
            .enablePositionalOptions(true)
            .hook('preAction', this.handlePreAction.bind(this))
            .showHelpAfterError();

        this.logger = options.logger instanceof Logger ? options.logger : new Logger(options.logger);

        this.logger.debugmode = {
            ...this.logger.debugmode,
            enabled: () => this.flags.debug,
            writeToFile: true
        };
    }

    public async parse(argv?: string[]): Promise<this> {
        await this.loadCommands();
        await this.command.parseAsync(argv);
        return this;
    }

    public async loadCommands(): Promise<void> {
        this.logger.debug(`Loading cli commands from ${this.options.subcommandsDir}`);

        const dirStat = await stat(this.options.subcommandsDir).catch(() => undefined);
        if (!dirStat?.isDirectory()) return;

        const files = (await readdir(this.options.subcommandsDir))
            .map(f => path.join(this.options.subcommandsDir, f))
            .filter(f => f.endsWith('.mjs'));

        const hasParent: CLISubcommand[] = [];

        for (const file of files) {
            const Subommand = recursiveDefaults<CLISubcommand.Constructor>(await import(path.isAbsolute(file) ? `file://${file}` : file));
            if (!Subommand || typeof Subommand !== 'function') continue;

            const instance = new Subommand({ cli: this, command: this.command });

            if (instance.parent) {
                hasParent.push(instance);
                continue;
            }

            CLISubcommand.registerSubcommand(instance);
        }

        for (const instance of hasParent) {
            CLISubcommand.registerSubcommand(instance);
        }
    }

    public async handlePreAction(cmd: Command, action: Command): Promise<void> {
        this.logger.debug(`Executing ${action.name()}`);
        this.logger.debug(`Debug mode is ${this.flags.debug ? 'enabled' : 'disabled'}`);
        process.env.NODE_ENV = this.flags.debug ? 'development' : process.env.NODE_ENV;

        loadEnv({
            path: this.flags.env.length ? this.flags.env : [path.join(process.cwd(), '.env')],
            debug: this.flags.debug,
            quiet: !this.flags.debug,
            ignore: ['MISSING_ENV_FILE']
        });

        this.logger.debug(`Loaded environment variables from ${this.flags.env.join(', ')}`);
    }

    public getFlags<Flags extends Record<string, any> = Record<string, any>>(command: Command|string, mergeDefault?: false): Flags|undefined;
    public getFlags<Flags extends Record<string, any> = Record<string, any>>(command: Command|string, mergeDefault: true): Flags & CLI.Flags|undefined;
    public getFlags(command?: undefined): CLI.Flags;
    public getFlags(command?: Command|string, mergeDefault: boolean = false): Record<string, any>|undefined {
        if (!command) return this.flags;

        command = typeof command === 'string' ? this.command.commands.find(c => c.name() === command) : command;
        const flags = command?.opts();

        return mergeDefault ? { ...this.flags, ...flags } : flags;
    }

    public getCommand(name: string): Command|undefined;
    public getCommand(name?: undefined): Command;
    public getCommand(name?: string): Command|undefined {
        if (!name) return this.command;

        return this.command.commands.find(c => c.name() === name);
    }
}

export namespace CLI {
    export interface Options {
        name: string;
        description: string;
        build: string;
        subcommandsDir: string;
        logger?: Logger|LoggerOptions;
    }

    export interface Flags {
        debug: boolean;
        env: string[];
    }

    export const root: string = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../');
    export const bin: string = path.join(CLI.root, 'dist/bin/reciple.js');
    export const version = process.env.__VERSION__;

    export function stringifyFlags(flags: Record<string, any>, command: Command, ignored: string[] = []): string[] {
        let arr: string[] = [];

        for (const [key, value] of Object.entries(flags)) {
            const option = command.options.find(o => o.name() === key || o.attributeName() === key);
            if (!option || ignored.includes(key)) continue;

            const flag = option.long ?? option.short ?? `--${option.name()}`;

            if (!option.flags.endsWith('>') && !option.flags.endsWith(']') && typeof value === 'boolean') {
                if (value) arr.push(flag);
                continue;
            }

            arr.push(flag, String(value));
        }

        return arr;
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

    export function createTsdownLogger(_logger: Logger = logger): RolldownPlugin {
        let startedAt: number;

        return {
            name: 'reciple:log-build-completion',
            buildStart: () => {
                _logger.log(colors.green('🚀 Building reciple modules...'));
                startedAt = Date.now();
            },
            renderChunk: (code, info) => {
                const size = Format.bytes(Buffer.byteLength(code, 'utf8'));
                _logger.log(` ├─ ${colors.cyan(size)}\t${colors.bold(info.fileName)}`);

                return { code };
            },
            buildEnd: error => {
                if (error) _logger.error(error)
            },
            closeBundle: () => {
                const time = Format.duration(Date.now() - startedAt);
                _logger.log(colors.green(`✅ Build success in `) + colors.yellow(`${time}`));
            }
        };
    }

    export const ignoredDefault = [
        '.git',
        '.log',
        '.nyc_output',
        '.sass-cache',
        '.yarn',
        'bower_components',
        'coverage',
        'node_modules'
    ]
}
