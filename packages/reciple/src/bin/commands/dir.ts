import { Command } from 'commander';
import { CLISubcommand } from '../../classes/CLISubcommand.js';
import { ConfigReader } from '../../classes/ConfigReader.js';
import { Logger } from 'prtyprnt';
import { ModuleLoader } from '../../classes/ModuleLoader.js';
import { isCancel, select } from '@clack/prompts';
import path from 'node:path';

// TODO: Temporary command
export default class DirSubcommand extends CLISubcommand {
    public subcommand: Command = new Command('dir')
        .description('View the directory of commands')
        .option('-c, --config <path>', 'Path to the configuration file');

    public async execute(): Promise<void> {
        const flags = this.subcommand.opts<DirSubcommand.Flags>();

        const configReader = new ConfigReader(
            flags.config
            ?? await ConfigReader.findConfigFromDirectory(process.cwd())
            ?? ConfigReader.createConfigFilename('js')
        );

        const { config, build } = await configReader.read({
            createIfNotExists: false
        });

        const tsconfig = await ConfigReader.resolveTsConfig(build.tsconfig);

        const logger = config.logger instanceof Logger
            ? config.logger
            : this.cli.logger.clone(config.logger);

        let directories = await ModuleLoader.scanForDirectories(config.modules);
            directories = await ModuleLoader.resolveSourceDirectories({
                directories,
                baseUrl: tsconfig.data.compilerOptions?.baseUrl ?? '.',
                rootDir: tsconfig.data.compilerOptions?.rootDir ?? 'src',
                outDir: tsconfig.data.compilerOptions?.outDir ?? 'modules',
                cwd: process.cwd()
            });

        const directory = await select({
            message: 'Select a directory',
            options: directories.map(directory => ({
                label: path.relative(process.cwd(), directory),
                value: directory
            }))
        });

        if (isCancel(directory)) return;

        logger.info(`Running command in directory ${directory}`);
        // TODO: Determine the output of built modules from build config
    }
}

export namespace DirSubcommand {
    export interface Flags {
        config?: string;
    }
}
