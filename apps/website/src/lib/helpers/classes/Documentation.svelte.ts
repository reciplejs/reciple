import type { DocNode } from '@deno/doc';
import path from 'pathe';

export class Documentation {
    private static files: Documentation.APIFilesResponse|null = null;

    public static readonly repository: Documentation.Repository = {
        owner: 'reciplejs',
        name: 'docs',
        branch: 'main',
        path: '/'
    };

    public static get repo() {
        return path.join(Documentation.repository.owner, Documentation.repository.name);
    }

    public readonly package: string;
    public readonly tag: string;

    public data: DocNode[] = $state([]);

    constructor(options: Documentation.Options) {
        this.package = options.package;
        this.tag = options.tag;
    }

    public async fetch() {}

    public static async fetchTags(pkg: string): Promise<string[]> {
        const files = await this.fetchFiles();

        return files.files
            .filter(file => file.path.startsWith(pkg))
            .map(file => path.basename(file.path).split('.')[0]);
    }

    public static async fetchPackages(): Promise<string[]> {
        const files = await this.fetchFiles();

        return Array.from(
            new Set(
                files.files
                    .filter(file => file.path.endsWith('.json'))
                    .map(file => path.dirname(file.path).split('/').shift()!)
            ).values()
        );
    }

    public static async fetchFiles(force: boolean = false) {
        return Documentation.files && !force
            ? Documentation.files
            : Documentation.files = await (await fetch(`https://ungh.cc/repos/${path.join(Documentation.repo)}/files/${Documentation.repository.branch}/`)).json() as Documentation.APIFilesResponse;
    }
}

export namespace Documentation {
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
}
