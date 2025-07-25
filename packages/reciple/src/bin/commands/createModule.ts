import { Command } from 'commander';
import { CLISubcommand } from '../../classes/cli/CLISubcommand.js';
import { ConfigReader } from '../../classes/cli/ConfigReader.js';
import { ModuleTemplateBuilder } from '../../classes/templates/ModuleTemplateBuilder.js';
import { cancel } from '@clack/prompts';
import { colors } from '@reciple/utils';
import { NotAnError } from '../../classes/NotAnError.js';
import { inspect } from 'node:util';

export default class CreateModuleSubcommand extends CLISubcommand {
    public subcommand: Command = new Command('module')
        .description('Creates new module')
        .argument('[output]', 'The directory to create the module in')
        .option('--template, -t <template>', 'Template source name')
        .option('--filename', 'The filename of the module')
        .option('-c, --config <path>', 'Path to the configuration file')
        .option('-T, --typescript', 'Use TypeScript')
        .option('-D, --default', 'Use defaults for prompts')
        .enablePositionalOptions(true);

    public parent: string = 'create';

    public async execute(): Promise<void> {
        const flags = this.subcommand.opts<CreateModuleSubcommand.Flags>();

        const configReader = await (
            new ConfigReader(
                flags.config
                ?? await ConfigReader.findConfigFromDirectory(process.cwd())
                ?? ConfigReader.createConfigFilename('js')
            ).read({
                createIfNotExists: false
            })
        );

        const template = new ModuleTemplateBuilder({
            cli: this.cli,
            config: configReader,
            typescript: flags.typescript,
            filename: flags.filename,
            defaultAll: flags?.default
        });

        try {
            await template.init();
            await template.setupLanguage();
            await template.setupTemplate();
            await template.setupPlaceholders();
            await template.setupDirectory();
            await template.setupFilename();
            await template.build();
        } catch (error) {
            cancel(colors.red(error instanceof NotAnError ? error.message : inspect(error)));
        }
    }
}

export namespace CreateModuleSubcommand {
    export interface Flags {
        template?: string;
        filename?: string;
        config?: string;
        typescript?: boolean;
        default?: boolean;
    }
}
