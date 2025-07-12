import type { Indent } from 'detect-indent';
import detectIndent from 'detect-indent';
import { detectNewline } from 'detect-newline';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { assign } from 'radash';
import type { PackageJson } from 'type-fest';

export class PackageJsonBuilder {
    public indent: Indent = { type: 'space', amount: 2, indent: '  ' };
    public newline: '\n'|'\r\n' = '\n';
    public data: PackageJson.PackageJsonStandard = {
        name: undefined,
        version: undefined,
        type: undefined,
        private: undefined,
        license: undefined,
        description: undefined,
        scripts: {},
        dependencies: {},
        devDependencies: {}
    };

    constructor(data?: Partial<PackageJson.PackageJsonStandard>) {
        Object.assign(this.data, data);
    }

    public toJSON(): PackageJson.PackageJsonStandard {
        return this.data;
    }

    public toString(): string {
        return JSON.stringify(this.data, null, this.indent.indent).replace(/\r\n|\n/g, this.newline);
    }

    public async write(filepath: string, overwrite?: boolean): Promise<string> {
        const content = this.toString();

        const stats = await stat(filepath).catch(() => undefined);
        if (stats?.isFile() && !overwrite) {
            throw new Error(`File already exists: ${filepath}`);
        }

        await mkdir(path.dirname(filepath), { recursive: true });
        await writeFile(filepath, content);

        return content;
    }

    public async read(filepath: string, detectNewLineAndIndent?: boolean): Promise<this> {
        const data = await readFile(filepath, 'utf-8');
        this.data = JSON.parse(data);

        if (detectNewLineAndIndent !== false) {
            this.indent = detectIndent(data);
            this.newline = detectNewline(data) ?? this.newline;
        }

        return this;
    }

    public setIndent(indent: Indent): this {
        this.indent = indent;
        return this;
    }

    public setNewline(newline: '\n'|'\r\n'): this {
        this.newline = newline;
        return this;
    }

    public merge(data: Partial<PackageJson.PackageJsonStandard>): this {
        this.data = assign(this.data, data);
        return this;
    }

    public remove(key: keyof PackageJson.PackageJsonStandard): this {
        delete this.data[key];
        return this;
    }

    public setScripts(scripts: Record<string, string>): this {
        this.data.scripts = scripts;
        return this;
    }

    public addScript(name: string, script: string): this {
        this.data.scripts ??= {};
        this.data.scripts[name] = script;
        return this;
    }

    public removeScript(name: string): this {
        this.data.scripts ??= {};
        delete this.data.scripts[name];
        return this;
    }

    public setDependencies(dependencies: Record<string, string>): this {
        this.data.dependencies = dependencies;
        return this;
    }

    public addDependency(name: string, version: string): this {
        this.data.dependencies ??= {};
        this.data.dependencies[name] = version;
        return this;
    }

    public removeDependency(name: string): this {
        this.data.dependencies ??= {};
        delete this.data.dependencies[name];
        return this;
    }

    public static async read(filepath: string, createIfNotExists?: boolean|Partial<PackageJson.PackageJsonStandard>): Promise<PackageJsonBuilder> {
        const stats = await stat(filepath).catch(() => undefined);
        if (!stats?.isFile()) {
            if (createIfNotExists === false) throw new Error('Invalid package.json file');

            const builder = new PackageJsonBuilder(typeof createIfNotExists !== 'object' ? {} : createIfNotExists);
            await builder.write(filepath);
            return builder;
        }

        const content = await readFile(filepath, 'utf8');
        const builder = new PackageJsonBuilder(JSON.parse(content));

        builder.setIndent(detectIndent(content));
        builder.setNewline(detectNewline(content) ?? '\n');

        return builder;
    }
}

export namespace PackageJsonBuilder {}

export type {
    Indent,
    PackageJson
};
