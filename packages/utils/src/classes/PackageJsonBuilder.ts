import { rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { readPackageJSON, resolvePackageJSON, writePackageJSON, type PackageJson } from 'pkg-types';
import { assign } from 'radash';

export class PackageJsonBuilder {
    public data: PackageJson = PackageJsonBuilder.defaultData;

    constructor(data?: Partial<PackageJson>) {
        Object.assign(this.data, data);
    }

    public toJSON(): PackageJson {
        return this.data;
    }

    public async write(filepath: string, overwrite?: boolean): Promise<void> {
        const stats = await stat(filepath).catch(() => undefined);
        if (stats && !overwrite) throw new Error('Package.json file already exists');

        await rm(filepath).catch(() => undefined);
        await writePackageJSON(filepath, this.data);
    }

    public async read(filepath: string): Promise<this> {
        this.data = await readPackageJSON(filepath);
        return this;
    }

    public merge(data: Partial<PackageJson>): this {
        this.data = assign(this.data, data);
        return this;
    }

    public remove(key: keyof PackageJson): this {
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

    public static async read(filepath: string, createIfNotExists?: boolean|Partial<PackageJson>): Promise<PackageJsonBuilder> {
        const file = await resolvePackageJSON(filepath).catch(() => null);

        if (!file && createIfNotExists) {
            const stats = await stat(filepath).catch(() => null);
            const data = typeof createIfNotExists === 'object' ? createIfNotExists : undefined;
            const builder = new PackageJsonBuilder(data);

            await builder.write(stats?.isDirectory() ? path.join(filepath, 'package.json') : filepath);
            return builder;
        }

        if (!file) throw new Error('package.json file not found');

        return new PackageJsonBuilder(await readPackageJSON(file));
    }
}

export namespace PackageJsonBuilder {
    export const defaultData: PackageJson = {
        name: undefined,
        version: undefined,
        type: undefined,
        private: undefined,
        license: undefined,
        description: undefined,
        scripts: undefined,
        dependencies: undefined,
        devDependencies: undefined,
        peerDependencies: undefined,
        optionalDependencies: undefined,
        bundledDependencies: undefined,
    };
}

export type { PackageJson };
