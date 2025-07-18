import { Command } from 'commander';
import { CLISubcommand } from '../../classes/CLISubcommand.js';
import { ConfigReader } from '../../classes/ConfigReader.js';
import { ModuleLoader } from '../../classes/ModuleLoader.js';
import { ModuleTemplateBuilder } from '../../classes/ModuleTemplateBuilder.js';

export default class CreateModuleSubcommand extends CLISubcommand {
    public subcommand: Command = new Command('module')
        .description('Creates new module')
        .argument('[output]', 'The directory to create the module in')
        .option('--template, -T <template>', 'Template source name')
        .option('--filename', 'The filename of the module')
        .option('-c, --config <path>', 'Path to the configuration file')
        .option('-T, --typescript', 'Use TypeScript')
        .option('-D, --default', 'Use defaults for prompts');

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

        const { config, build } = configReader;

        const tsconfig = ConfigReader.resolveTsConfig(build.tsconfig);
        const template = new ModuleTemplateBuilder({
            cli: this.cli,
            config: configReader,
            typescript: flags.typescript,
            filename: flags.filename,
            defaultAll: flags?.default
        });

        await template.setupLanguage();
        // TODO: Complete setup

        let directories = await ModuleLoader.scanForDirectories(config.modules);
            directories = await ModuleLoader.resolveSourceDirectories({
                directories,
                baseUrl: tsconfig.data.compilerOptions?.baseUrl ?? '.',
                rootDir: tsconfig.data.compilerOptions?.rootDir ?? 'src',
                outDir: tsconfig.data.compilerOptions?.outDir ?? 'modules',
                cwd: process.cwd()
            });
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
