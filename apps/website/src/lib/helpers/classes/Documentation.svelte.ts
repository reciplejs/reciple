import { resolve } from '$app/paths';
import type { ClassMethodDef, ClassPropertyDef, DocNode, DocNodeKind, EnumMemberDef, InterfaceMethodDef, InterfacePropertyDef, JsDoc, JsDocTagDoc, JsDocTagDocRequired, JsDocTagKind, JsDocTagNamed, JsDocTagNamedTyped, JsDocTagOnly, JsDocTagParam, JsDocTagReturn, JsDocTagTags, JsDocTagTyped, JsDocTagUnsupported, JsDocTagValued } from '@deno/doc';
import { slug } from 'github-slugger';
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

    public getTypeLink(type: string|DocNode): string|undefined {
        let node: DocNode|null = null;
        let element: Documentation.DocNodeElement|null = null;

        if (typeof type === 'string') {
            let name = type.split('.')[0];
            let prop = type.split('.')[1];

            const data = prop ? this.findNodeWithElement(name, prop) : { node: this.find(name), element: null };

            node = data?.node ?? null;
            element = data?.element ?? null;
        } else {
            node = type;
        }

        return node ? this.resolveNodeLink(node, element) : undefined;
    }

    public findNodeWithElement(name: string, elementName: string, type?: DocNodeKind): { node: DocNode; element: Documentation.DocNodeElement|null; }|null {
        let node: DocNode|null = null;
        let element: Documentation.DocNodeElement|null = null;

        node = this.data.find(n => 
            n.name === name
            && (!type || n.kind === type)
            && !!(element = this.getNodeElement(n, elementName))
        ) ?? null;

        if (!node) return null;

        return {
            node,
            element
        };
    }

    public getNodeElement(node: DocNode, elementName: string): Documentation.DocNodeElement|null {
        switch (node.kind) {
            case 'class':
                return node.classDef.properties.find(prop => prop.name === elementName)
                    ?? node.classDef.methods.find(method => method.name === elementName)
                    ?? null;
            case 'interface':
                return node.interfaceDef.properties.find(prop => prop.name === elementName)
                    ?? node.interfaceDef.methods.find(method => method.name === elementName)
                    ?? null;
            case 'namespace':
                return node.namespaceDef.elements.find(prop => prop.name === elementName) ?? null;
            case 'enum':
                return node.enumDef.members.find(prop => prop.name === elementName) ?? null;
        }

        return null;
    }

    public resolveNodeLink(node: DocNode, element: Documentation.DocNodeElement|null = null): string {
        const link = resolve('/(main)/docs/[package]/[tag]/[...slug]', {
            package: this.package,
            tag: this.tag,
            slug: `${node.kind}/${node.name}`
        });

        return link + (element ? `#${this.getElementSlug(element)}` : '');
    }

    public getElementSlug(element: Documentation.DocNodeElement): string {
        let result = '';

        if ('isStatic' in element && element.isStatic) {
            result += 'static-';
        }

        if ('kind' in element) {
            result += `${element.kind}`;
        }

        return `${result ? result + ':' : ''}${slug(element.name, true)}`;
    }

    public getJsdocTag<T extends JsDocTagKind>(type: { jsDoc?: JsDoc }, tag: T): Documentation.JsDocTagFromKind<T>|null {
        return type.jsDoc?.tags?.find((t): t is Documentation.JsDocTagFromKind<T> => t.kind === tag) ?? null;
    }

    public async fetch(fetch: Documentation.FetchClient = Documentation.defaultFetch): Promise<this> {
        const { files } = await Documentation.fetchFiles(false, fetch);

        const file = files.find(file => file.path === path.join(this.package, `${this.tag}.json`));
        const filePath = file?.path ?? `${this.package}/${this.tag}.json`;

        const content: Documentation.APIDocJSONResponse = await fetch(`https://ungh.cc/repos/${path.join(Documentation.repo)}/files/${Documentation.repository.branch}/${filePath}`).then(res => res.json());

        this.data = content.nodes;
        this.readme = content.readme || '';

        return this;
    }

    public static async fetchTags(pkg: string, fetch?: Documentation.FetchClient): Promise<string[]> {
        const { files } = await this.fetchFiles(false, fetch);

        return files
            .filter(file => file.path.startsWith(pkg))
            .map(file => path.basename(file.path).replace('.json', ''));
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
    export type DocNodeElement = ClassPropertyDef|ClassMethodDef|InterfacePropertyDef|InterfaceMethodDef|DocNode|EnumMemberDef;

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

    // WTF
    export type JsDocTagFromKind<K extends JsDocTagKind> =
        K extends "constructor"|"ignore"|"module"|"public"|"private"|"protected"|"readonly"
            ? JsDocTagOnly
            : K extends "deprecated"
                ? JsDocTagDoc
                : K extends "category"|"example"|"see"
                    ? JsDocTagDocRequired
                    : K extends "callback"|"template"
                        ? JsDocTagNamed
                        : K extends "default"
                            ? JsDocTagValued
                            : K extends "enum"|"extends"|"this"|"type"
                                ? JsDocTagTyped
                                : K extends "property"|"typedef"
                                    ? JsDocTagNamedTyped
                                    : K extends "param"
                                        ? JsDocTagParam
                                        : K extends "return"
                                            ? JsDocTagReturn
                                            : K extends "tags"
                                                ? JsDocTagTags
                                                : K extends "unsupported"
                                                    ? JsDocTagUnsupported
                                                    : never;
}
