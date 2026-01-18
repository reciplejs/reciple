import type { DocNode, DocNodeKind } from '@deno/doc';
import path from 'pathe';

export class Documentation {
    private static files: Documentation.APIFilesResponse|null = null;

    public static readonly repository: Documentation.Repository = {
        owner: 'reciplejs',
        name: 'docs',
        branch: 'main',
        path: '/'
    };

    public static get repo(): string {
        return path.join(Documentation.repository.owner, Documentation.repository.name);
    }

    public static get packages(): string[] {
        return Array.from(
            new Set(
                Documentation.files?.files
                    .filter(file => file.path.endsWith('.json'))
                    .map(file => path.dirname(file.path).split('/').shift()!)
            ).values()
        );
    }

    public readonly package: string;
    public readonly tag: string;

    public data: DocNode[] = $state([]);
    public readme: string = $state('');

    get classes() { return this.data.filter(node => node.kind === "class"); }
    get namespaces() { return this.data.filter(node => node.kind === "namespace"); }
    get functions() { return this.data.filter(node => node.kind === "function"); }
    get variables() { return this.data.filter(node => node.kind === "variable"); }
    get enums() { return this.data.filter(node => node.kind === "enum"); }
    get interfaces() { return this.data.filter(node => node.kind === "interface"); }
    get types() { return this.data.filter(node => node.kind === "typeAlias"); }

    constructor(options: Documentation.Options) {
        this.package = options.package;
        this.tag = options.tag;
    }

    public find(name: string, type?: DocNodeKind): DocNode|null {
        return this.data.find(node => node.name === name && (!type || node.kind === type)) || null;
    }

    public async fetch(fetch: Documentation.FetchClient = Documentation.defaultFetch): Promise<this> {
        const { files } = await Documentation.fetchFiles(false, fetch);

        const file = files.find(file => file.path === path.join(this.package, `${this.tag}.json`));

        if (!file) throw new Error('File not found');

        const content: Documentation.APIDocJSONResponse = await fetch(`https://ungh.cc/repos/${path.join(Documentation.repo)}/files/${Documentation.repository.branch}/${file.path}`).then(res => res.json());

        this.data = content.nodes;
        this.readme = content.readme || '';

        return this;
    }

    public static async fetchTags(pkg: string, fetch?: Documentation.FetchClient): Promise<string[]> {
        const { files } = await this.fetchFiles(false, fetch);

        return files
            .filter(file => file.path.startsWith(pkg))
            .map(file => path.basename(file.path).split('.')[0]);
    }

    public static async fetchPackages(fetch?: Documentation.FetchClient): Promise<string[]> {
        await this.fetchFiles(false, fetch);

        return Documentation.packages;
    }

    public static async fetchFiles(force: boolean = false, fetch: Documentation.FetchClient = Documentation.defaultFetch): Promise<Documentation.APIFilesResponse> {
        return Documentation.files && !force
            ? Documentation.files
            : Documentation.files = await (await fetch(`https://ungh.cc/repos/${path.join(Documentation.repo)}/files/${Documentation.repository.branch}/`)).json() as Documentation.APIFilesResponse;
    }
}

export namespace Documentation {
    export const defaultFetch = fetch;

    export type FetchClient = typeof fetch;

    export interface Options {
        package: string;
        tag: string;
    }

    export interface Repository {
        owner: string;
        name: string;
        branch: string;
        path?: string;
    }

    export interface APIFilesResponse {
        meta: Record<'sha', string>;
        files: {
            path: string;
            mode: string;
            sha: string;
            size: number;
        }[];
    }

    export interface APIDocJSONResponse {
        version: string;
        readme?: string;
        nodes: DocNode[];
    }
}
