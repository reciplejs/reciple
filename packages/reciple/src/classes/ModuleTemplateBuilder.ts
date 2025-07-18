import path from 'node:path';
import { CLI } from './CLI.js';
import { ModuleType } from '../helpers/constants.js';
import { BaseModule } from './modules/BaseModule.js';
import { MessageCommandModule } from './modules/commands/MessageCommandModule.js';
import { SlashCommandModule } from './modules/commands/SlashCommandModule.js';
import { ContextMenuCommandModule } from './modules/commands/ContextMenuCommandModule.js';
import { ClientEventModule } from './modules/events/ClientEventModule.js';
import { EventModule } from './modules/events/EventModule.js';
import { RESTEventModule } from './modules/events/RESTEventModule.js';
import { PostconditionModule } from './modules/PostconditionModule.js';
import { PreconditionModule } from './modules/PreconditionModule.js';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { ConfigReader } from './ConfigReader.js';
import { confirm, intro, isCancel, outro, select, text } from '@clack/prompts';
import { NotAnError } from './NotAnError.js';
import { ApplicationCommandType } from 'discord.js';
import { ModuleLoader } from './ModuleLoader.js';
import { existsSync } from 'node:fs';
import { colors } from '@reciple/utils';

export class ModuleTemplateBuilder {
    public _directory?: string;

    public readonly cli: CLI;
    public readonly config: ConfigReader;

    public template?: ModuleTemplateBuilder.Data;
    public typescript?: boolean;
    public filename?: string;
    public defaultAll: boolean;

    get content() {
        return this.template?.content ?? '';
    }

    get directory() {
        return this._directory ?? process.cwd();
    }

    get filepath() {
        return path.join(this.directory, this.filename ?? '');
    }

    constructor(options: ModuleTemplateBuilder.Options) {
        this.cli = options.cli;
        this.config = options.config;
        this.template = options?.template;
        this.typescript = options?.typescript;
        this._directory = options?.directory;
        this.filename = options?.filename;
        this.defaultAll = options?.defaultAll ?? false;
    }

    public async init(): Promise<this> {
        intro(colors.bold(colors.black(colors.bgCyan(` ${this.cli.command.name()} create module - v${this.cli.build} `))));
        return this;
    }

    public async setupLanguage(options?: ModuleTemplateBuilder.SetupLanguageOptions): Promise<this> {
        this.typescript = options?.typescript ?? this.typescript;

        if (!this.typescript) {
            const isTypeScriptDefault = (await ConfigReader.getProjectType(this.directory)) === 'ts';
            const isTypeScript = this.defaultAll
                ? isTypeScriptDefault
                : await confirm({
                    message: 'Would you like to use TypeScript?',
                    active: 'Yes',
                    inactive: 'No',
                    initialValue: isTypeScriptDefault
                });

            if (isCancel(isTypeScript)) throw new NotAnError('Operation cancelled');
            this.typescript = isTypeScript;
        }

        return this;
    }

    public async setupTemplate(options?: ModuleTemplateBuilder.SetupTemplateOptions): Promise<this> {
        let template = typeof options?.template === 'object' ? options.template : undefined;

        if (!template) {
            const templateName = typeof options?.template === 'string' ? options.template : undefined;
            const templates = await ModuleTemplateBuilder.resolveModuleTemplates(this.typescript ? 'ts' : 'js');

            const selectedTemplate = this.defaultAll
                ? templates.at(0)
                : await select({
                    message: 'Select a module template',
                    options: templates.map(template => ({
                        label: template.name,
                        value: template
                    }))
                });

            if (isCancel(selectedTemplate)) throw new NotAnError('Operation cancelled');
            template = selectedTemplate;
        }

        this.template = template;
        if (!this.template) throw new NotAnError('No template selected');

        return this;
    }

    public async setupPlaceholders(): Promise<this> {
        const placeholders = Object.keys(ModuleTemplateBuilder.Placeholder).filter(k => !k.startsWith('$')) as (keyof typeof ModuleTemplateBuilder.Placeholder)[];

        for (const placeholderKey of placeholders) {
            if (!ModuleTemplateBuilder.hasPlaceholder(ModuleTemplateBuilder.Placeholder[placeholderKey], this.content)) continue;
            const placeholder = ModuleTemplateBuilder.Placeholder[placeholderKey];
            const defaultValue = ModuleTemplateBuilder.PlaceholderDefaultValues[placeholder];

            let value: string|symbol;

            if (this.defaultAll) {
                value = defaultValue;
            } else {
                switch (placeholder) {
                    case ModuleTemplateBuilder.Placeholder.ModuleName:
                    case ModuleTemplateBuilder.Placeholder.CommandName:
                        value = this.defaultAll
                            ? defaultValue
                            : await text({
                                message: `What would you like to name the ${placeholder === ModuleTemplateBuilder.Placeholder.ModuleName ? 'module' : 'command'}?`,
                                initialValue: defaultValue,
                                placeholder: defaultValue,
                                defaultValue,
                                validate: (value) => {
                                    if (!value) return 'Please enter a value';
                                    if (value.includes(' ')) return 'Please enter a value without spaces';
                                }
                            });
                        break;
                    case ModuleTemplateBuilder.Placeholder.CommandContextMenuType:
                        const type = await select({
                                message: 'Select a command context menu type',
                                options: [
                                    { label: 'Message', value: ApplicationCommandType.Message },
                                    { label: 'User', value: ApplicationCommandType.User }
                                ],
                                initialValue: ApplicationCommandType.Message
                            });

                        value = isCancel(type) ? type : `${type}`;
                        break;
                    default:
                        value = await text({
                            message: `What would you like to use for the ${placeholder}?`,
                            initialValue: defaultValue,
                            placeholder: defaultValue,
                            defaultValue
                        });
                        break;
                }
            }

            if (isCancel(value)) throw new NotAnError('Operation cancelled');
            if (!this.template) throw new NotAnError('No template selected');
            this.template.content = ModuleTemplateBuilder.removeExpectedErrorComments(this.content.replaceAll(placeholder, value));
        }

        return this;
    }

    public async setupDirectory(options?: ModuleTemplateBuilder.SetupDirectoryOptions): Promise<this> {
        let directory = options?.directory;

        if (!directory) {
            const tsconfig = ConfigReader.resolveTsConfig(this.config.build.tsconfig);
            const cwd = process.cwd();

            let directories = await ModuleLoader.scanForDirectories(this.config.config.modules);
                directories = await ModuleLoader.resolveSourceDirectories({
                    directories,
                    baseUrl: tsconfig.data.compilerOptions?.baseUrl ?? '.',
                    rootDir: tsconfig.data.compilerOptions?.rootDir ?? 'src',
                    outDir: tsconfig.data.compilerOptions?.outDir ?? 'modules',
                    cwd
                });

            const selectedDirectory = this.defaultAll
                ? directories.at(0)
                : await select({
                    message: 'Select a directory',
                    options: directories.map(directory => ({
                        label: path.relative(cwd, directory),
                        value: directory
                    }))
                });

            if (isCancel(selectedDirectory)) throw new NotAnError('Operation cancelled');
            directory = selectedDirectory;
        }

        if (!directory) throw new NotAnError('No directory selected');
        this._directory = directory;

        return this;
    }

    public async setupFilename(options?: ModuleTemplateBuilder.SetupFilenameOptions): Promise<this> {
        let filename = options?.filename;

        if (!filename) {
            const defaultFilename = `${this.template?.name}.${this.typescript ? 'ts' : 'js'}`;
            const selectedFilename = this.defaultAll
                ? defaultFilename
                : await text({
                    message: 'What would you like to name the module file?',
                    initialValue: defaultFilename,
                    placeholder: defaultFilename,
                    defaultValue: defaultFilename,
                    validate: (value) => {
                        if (!value) return 'Please enter a value';
                        if (existsSync(path.join(this.directory, value))) return 'File already exists';
                    }
                });

            if (isCancel(selectedFilename)) throw new NotAnError('Operation cancelled');
            filename = selectedFilename;
        }

        if (!filename) throw new NotAnError('No filename selected');
        this.filename = filename;

        return this;
    }

    public async build(overwrite: boolean = false): Promise<this> {
        await writeFile(this.filepath, this.content, { flag: overwrite === false ? 'wx' : undefined });
        outro(`Module ${colors.green(this.template?.name!)} created in ${colors.cyan(path.relative(process.cwd(), this.filepath))}`);
        return this;
    }
}

export namespace ModuleTemplateBuilder {
    export interface Options {
        cli: CLI;
        config: ConfigReader;
        template?: ModuleTemplateBuilder.Data;
        typescript?: boolean;
        directory?: string;
        filename?: string;
        defaultAll?: boolean;
    }

    export interface SetupLanguageOptions {
        typescript?: boolean;
    }

    export interface SetupTemplateOptions {
        template?: ModuleTemplateBuilder.Data|string;
    }

    export interface SetupDirectoryOptions {
        directory?: string;
    }

    export interface SetupFilenameOptions {
        filename?: string;
    }

    export enum Placeholder {
        ModuleName = '$MODULE_NAME$',
        CommandName = '$COMMAND_NAME$',
        CommandContextMenuType = '$COMMAND_CONTEXT_MENU_TYPE$'
    }

    export const PlaceholderDefaultValues: Record<Placeholder, string> = {
        [Placeholder.ModuleName]: 'MyModule',
        [Placeholder.CommandName]: 'my-command',
        [Placeholder.CommandContextMenuType]: `${ApplicationCommandType.Message}`
    }

    export const SourceDirectory = {
        js: path.join(CLI.root, './assets/modules/javascript'),
        ts: path.join(CLI.root, './assets/modules/typescript`')
    };

    export const ModuleTypeClassName: Record<ModuleType, string[]> = {
        [ModuleType.Base]: [BaseModule.name],
        [ModuleType.Command]: [MessageCommandModule.name, SlashCommandModule.name, ContextMenuCommandModule.name],
        [ModuleType.Event]: [ClientEventModule.name, EventModule.name, RESTEventModule.name],
        [ModuleType.Postcondition]: [PostconditionModule.name],
        [ModuleType.Precondition]: [PreconditionModule.name]
    };

    export interface Data {
        src: string;
        name: string;
        content: string;
        moduleType: ModuleType|null;
    }

    export async function resolveModuleTemplates(type: 'js'|'ts'): Promise<ModuleTemplateBuilder.Data[]> {
        const src = ModuleTemplateBuilder.SourceDirectory[type];
        const files: string[] = await readdir(src).catch(() => []);
        const templates: ModuleTemplateBuilder.Data[] = [];

        for (const file of files) {
            const filepath = path.join(src, file);
            const content = await readFile(filepath, 'utf-8');
            const moduleType = ModuleTemplateBuilder.getModuleTemplateContentType(content);

            templates.push({ src: filepath, name: path.parse(filepath).name, content, moduleType });
        }

        return templates;
    }

    export function getModuleTemplateContentType(content: string): ModuleType|null {
        const createExtendStatement = (name: string) => `export class ${Placeholder.ModuleName} extends ${name}`;

        for (const type of Object.keys(ModuleTypeClassName).map(Number) as ModuleType[]) {
            const statements = ModuleTypeClassName[type].map(createExtendStatement);

            for (const statement of statements) {
                if (content.includes(statement)) return type;
            }
        }

        return null;
    }

    export function hasPlaceholder(placeholder: Placeholder, content: string): boolean {
        return content.includes(placeholder);
    }

    export function removeExpectedErrorComments(content: string): string {
        const lines = content.split('\n');

        return lines
            .filter(line => !line.trim().includes('// @expected-error'))
            .join('\n');
    }
}
