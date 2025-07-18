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
import { confirm, isCancel } from '@clack/prompts';
import { NotAnError } from './NotAnError.js';

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

    constructor(options: ModuleTemplateBuilder.Options) {
        this.cli = options.cli;
        this.config = options.config;
        this.template = options?.template;
        this.typescript = options?.typescript;
        this._directory = options?.directory;
        this.filename = options?.filename;
        this.defaultAll = options?.defaultAll ?? false;
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

    public async build(filepath: string, overwrite: boolean = false): Promise<this> {
        await writeFile(filepath, this.content, {
            flag: overwrite ? '' : undefined
            // TODO: What's the flag lol
        });

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

    export enum Placeholders {
        ModuleName = '$MODULE_NAME$',
        CommandName = '$COMMAND_NAME$',
        CommandContextMenuType = '$COMMAND_CONTEXT_MENU_TYPE$'
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
        const createExtendStatement = (name: string) => `export class ${Placeholders.ModuleName} extends ${name}`;

        for (const type of Object.keys(ModuleTypeClassName).map(Number) as ModuleType[]) {
            const statements = ModuleTypeClassName[type].map(createExtendStatement);

            for (const statement of statements) {
                if (content.includes(statement)) return type;
            }
        }

        return null;
    }

    export function hasPlaceholder(placeholder: Placeholders, content: string): boolean {
        return content.includes(placeholder);
    }
}
