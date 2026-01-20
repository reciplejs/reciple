import { rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { readPackageJSON, resolvePackageJSON, writePackageJSON, type PackageJson } from 'pkg-types';
import { assign } from 'radash';

/**
 * A package.json builder class
 */
export class PackageJsonBuilder {
    /**
     * The package.json data object
     */
    public data: PackageJson = PackageJsonBuilder.defaultData;

    /**
     * @param data The initial package.json data
     */
    constructor(data?: Partial<PackageJson>) {
        Object.assign(this.data, data);
    }

    /**
     * Returns the package.json data
     * @returns The package.json data object
     */
    public toJSON(): PackageJson {
        return this.data;
    }

    /**
     * Writes the package.json data to the given filepath
     * @param filepath The filepath to write the package.json data to
     * @param overwrite Whether to overwrite the file if it already exists
     * @returns A promise that resolves when the file has been written
     */
    public async write(filepath: string, overwrite?: boolean): Promise<void> {
        const stats = await stat(filepath).catch(() => undefined);
        if (stats && !overwrite) throw new Error('Package.json file already exists');

        await rm(filepath).catch(() => undefined);
        await writePackageJSON(filepath, this.data);
    }

    /**
     * Reads the package.json data from the given filepath
     * @param filepath The filepath to read the package.json data from
     * @returns A promise that resolves when the file has been read
     */
    public async read(filepath: string): Promise<this> {
        this.data = await readPackageJSON(filepath);
        return this;
    }

    /**
     * Merges the given package.json data into the current package.json data
     * @param data The package.json data to merge
     * @returns The current package.json builder
     */
    public merge(data: Partial<PackageJson>): this {
        this.data = assign(this.data, data);
        return this;
    }

    /**
     * Removes the given key from the package.json data
     * @param key The key to remove
     * @returns The current package.json builder
     */
    public remove(key: keyof PackageJson): this {
        delete this.data[key];
        return this;
    }

    /**
     * Sets the package.json scripts
     * @param scripts The scripts to set
     * @returns The current package.json builder
     */
    public setScripts(scripts: Record<string, string>): this {
        this.data.scripts = scripts;
        return this;
    }

    /**
     * Adds a script to the package.json
     * @param name The name of the script
     * @param script The script that will be executed
     * @returns The current package.json builder
     */
    public addScript(name: string, script: string): this {
        this.data.scripts ??= {};
        this.data.scripts[name] = script;
        return this;
    }

    /**
     * Removes a script from the package.json
     * @param name The name of the script
     * @returns The current package.json builder
     */
    public removeScript(name: string): this {
        this.data.scripts ??= {};
        delete this.data.scripts[name];
        return this;
    }

    /**
     * Sets the package.json dependencies
     * @param dependencies The dependencies to set
     * @returns The current package.json builder
     */
    public setDependencies(dependencies: Record<string, string>): this {
        this.data.dependencies = dependencies;
        return this;
    }

    /**
     * Adds a dependency to the package.json
     * @param name The name of the dependency
     * @param version The version of the dependency
     * @param [dev=false] Whether the dependency is a dev dependency
     * @returns The current package.json builder
     */
    public addDependency(name: string, version: string, dev: boolean = false): this {
        this.data.dependencies ??= {};
        this.data.dependencies[name] = version;
        return this;
    }

    /**
     * Removes a dependency from the package.json
     * @param name The name of the dependency
     * @param [dev=false] Whether the dependency is a dev dependency
     * @returns The current package.json builder
     */
    public removeDependency(name: string, dev: boolean = false): this {
        this.data.dependencies ??= {};
        delete this.data.dependencies[name];
        return this;
    }

    /**
     * Reads the package.json data from the given filepath and creates it if it doesn't exist
     * @param filepath The filepath to read the package.json data from
     * @param createIfNotExists Whether to create the package.json file if it doesn't exist
     * @returns A promise that resolves to a package.json builder
     */
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
    /**
     * The default package.json data
     */
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
