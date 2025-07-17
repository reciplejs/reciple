import { Command, Option } from 'commander';
import { CLISubcommand } from '../../classes/CLISubcommand.js';
import { colors, PackageManager } from '@reciple/utils';
import { TemplateBuilder } from '../../classes/TemplateBuilder.js';
import { cancel } from '@clack/prompts';
import { inspect } from 'node:util';
import { NotAnError } from '../../classes/NotAnError.js';

export default class CreateSubcommand extends CLISubcommand {
    public subcommand: Command = new Command('create')
        .description('Create a new Reciple project')
        .argument('[output]', 'The directory to create the project in')
        .option('-c, --config <path>', 'Path to the configuration file')
        .option('-t, --token <DiscordToken>', 'Set your Discord Bot token')
        .option('-T, --typescript', 'Use TypeScript')
        .addOption(new Option('-p, --package-manager <name>', 'The name of the package manager to use')
            .choices(PackageManager.all)
        )
        .option('-D, --default', 'Use defaults for prompts')
        .allowUnknownOption(true);

    public async execute(): Promise<void> {
        const flags = this.cli.getFlags<CreateSubcommand.Flags>('create');
        const template = new TemplateBuilder({
            cli: this.cli,
            directory: this.subcommand.args[0],
            typescript: flags?.typescript,
            packageManager: flags?.packageManager && new PackageManager(flags.packageManager),
            defaultAll: flags?.default,
            token: flags?.token
        });

        try {
            await template.init();
            await template.createDirectory();
            await template.setupLanguage();
            await template.createConfig();
            await template.createPackageManager();
            await template.checkInstalledPackageManager();
            await template.createTemplate();
            await template.createEnvFile({ envFile: this.cli.flags.env[0] });
            await template.build();
        } catch (error) {
            cancel(colors.red(error instanceof NotAnError ? error.message : inspect(error)));
        }
    }
}

export namespace CreateSubcommand {
    export interface Flags {
        config?: string;
        token?: string;
        default?: boolean;
        typescript?: boolean;
        packageManager?: PackageManager.Type;
    }
}
