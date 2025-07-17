import { Command } from 'commander';
import { CLISubcommand } from '../../classes/CLISubcommand.js';
import { ConfigReader } from '../../classes/ConfigReader.js';
import { Logger } from 'prtyprnt';
import { build } from 'tsup';

export default class BuildSubcommand extends CLISubcommand {
    public subcommand: Command = new Command('build')
        .description('Build the reciple modules defined in config file')
        .option('-c, --config <path>', 'Path to the configuration file');

    public async execute(): Promise<void> {
        const flags = this.subcommand.opts<BuildSubcommand.Flags>();

        const configReader = new ConfigReader(
            flags.config
            ?? await ConfigReader.findConfigFromDirectory(process.cwd())
            ?? ConfigReader.createConfigFilename('js')
        );

        const { config, build: buildConfig } = await configReader.read({
            createIfNotExists: false
        });

        const logger = config.logger instanceof Logger
            ? config.logger
            : this.cli.logger.clone(config.logger);

        await build(buildConfig);
    }
}

export namespace BuildSubcommand {
    export interface Flags {
        config?: string;
    }
}
