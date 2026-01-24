import { Command, Option } from 'commander';
import { CLISubcommand } from '../../classes/cli/CLISubcommand.js';
import { TemplateBuilder } from '../../classes/templates/TemplateBuilder.js';
import { cancel } from '@clack/prompts';
import { inspect } from 'node:util';
import { NotAnError } from '../../classes/NotAnError.js';
import type { PackageManagerName } from 'nypm';
import { colors } from '@prtty/prtty';

export default class CreateSubcommand extends CLISubcommand {
    public subcommand: Command = new Command('create')
        .description('Create a new reciple project')
        .argument('[project]', 'The root directory of your project')
        .option('-c, --config <path>', 'Path to the configuration file')
        .option('-t, --token <DiscordToken>', 'Set your Discord Bot token')
        .option('-T, --typescript', 'Use TypeScript')
        .addOption(new Option('-p, --package-manager <name>', 'The name of the package manager to use')
            .choices(['npm', 'yarn', 'pnpm', 'bun', 'deno'])
        )
        .option('-D, --default', 'Use defaults for prompts')
        .option('--install', 'Install dependencies during setup', true)
        .option('--no-install', 'Do not install dependencies during setup')
        .option('--build', 'Build the project after creation', true)
        .option('--no-build', 'Do not build the project after creation')
        .allowUnknownOption(true);

    public async execute(): Promise<void> {
        const flags = this.cli.getFlags<CreateSubcommand.Flags>('create');
        const template = new TemplateBuilder({
            cli: this.cli,
            typescript: flags?.typescript,
            packageManager: flags?.packageManager,
            defaultAll: flags?.default,
            token: flags?.token,
        });

        try {
            await template.init();
            await template.createDirectory({ directory: this.subcommand.args[0] });
            await template.setupLanguage();
            await template.createConfig();
            await template.createEnvFile({ envFile: this.cli.flags.env[0] });
            await template.createTemplate();
            await template.setPackageManager();
            await template.installDependencies({ value: flags?.install });
            await template.createModules();
            await template.build({ skipBuild: !flags?.build });
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
        packageManager?: PackageManagerName;
        install: boolean;
        build: boolean;
    }
}
