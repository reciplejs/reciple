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
            ?? await ConfigReader.find()
            ?? ConfigReader.createConfigFilename('js')
        );

        const { build: buildConfig } = await configReader.read();

        let plugins = buildConfig.plugins
            ? Array.isArray(buildConfig.plugins)
                ? buildConfig.plugins
                : [buildConfig.plugins]
            : [];

        plugins.push(CLI.createTsdownLogger(this.cli.logger));

        await build({
            ...buildConfig,
            logLevel: 'silent',
            plugins,
        });
    }
}

export namespace BuildSubcommand {
    export interface Flags {
        config?: string;
    }
}
