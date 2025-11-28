import { Command } from 'commander';
import { CLISubcommand } from '../../classes/cli/CLISubcommand.js';
import { ConfigReader } from '../../classes/cli/ConfigReader.js';
import { build } from 'tsdown';
import { CLI } from '../../classes/cli/CLI.js';

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

        const { build: buildConfig } = await configReader.read({
            createIfNotExists: false
        });

        await build({
            ...buildConfig,
            plugins: [
                CLI.createTsdownLogger()
            ],
            silent: true
            // TODO: Add tsdown logger plugin
        });
    }
}

export namespace BuildSubcommand {
    export interface Flags {
        config?: string;
    }
}
