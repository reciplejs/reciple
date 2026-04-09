import type { Symbol, Document, Declaration, DocNodeKind, ClassMethodDef, EnumMemberDef, ClassPropertyDef, InterfaceMethodDef, InterfacePropertyDef, JsDocTagKind, JsDoc } from '@deno/doc';
import { filterAndSortTags } from '../utils';
import path from 'pathe';
import { slug } from 'github-slugger';
import { resolve } from '$app/paths';
import { getEnumMembers } from '../../components/shared/main/docs/EnumPage.svelte';

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

    public symbols: Symbol[] = $state([]);
    public readme: string = $state('');

    constructor(options: Documentation.Options) {
        this.package = options.package;
        this.tag = options.tag;
    }

    public find<K extends DocNodeKind = DocNodeKind>(name: string, kind?: K): { symbol: Symbol; declaration: Documentation.DeclarationFromKind<K>; }|null {
        const symbol = this.symbols.find(s => s.name === name) ?? null;
        const declaration = symbol?.declarations.find(d => !kind || d.kind === kind) ?? null;

        if (!symbol || !declaration) return null;

        return { symbol, declaration: declaration as Documentation.DeclarationFromKind<K> };
    }

    public getDeclarations<K extends DocNodeKind = DocNodeKind>(kind?: K): Record<string, { symbol: Symbol; declaration: Documentation.DeclarationFromKind<K>; }[]> {
        const symbols: Record<string, { symbol: Symbol; declaration: Documentation.DeclarationFromKind<K>; }[]> = {};

        for (const symbol of this.symbols) {
            for (const declaration of symbol.declarations) {
                if (kind && declaration.kind !== kind) continue;

                symbols[symbol.name] ??= [];
                symbols[symbol.name].push({ symbol, declaration: declaration as Documentation.DeclarationFromKind<K> });
            }
        }

        return symbols;
    }

    public getElementSlug(name: string, element: Documentation.DeclarationElement): string {
        let result = '';

        if ('isStatic' in element && element.isStatic) {
            result += 'static-';
        }

        if ('kind' in element) {
            result += `${element.kind}`;
        }

        return `${result ? result + ':' : ''}${slug(name, true)}`;
    }

    public getJsdocTag<T extends JsDocTagKind>(type: { jsDoc?: JsDoc }, tag: T): Documentation.JsDocTagByKind<T>|null {
        return type.jsDoc?.tags?.find((t): t is Documentation.JsDocTagByKind<T> => t.kind === tag) ?? null;
    }

    public getDeclarationPath(
        name: string,
        declaration: Declaration,
        element: { name: string; declaration: Documentation.DeclarationElement; }|null = null
    ): string {
        const link = resolve('/(main)/docs/[package]/[tag]/[...slug]', {
            package: this.package,
            tag: this.tag,
            slug: `${declaration.kind}/${name}`
        });

        return link + (element ? `#${this.getElementSlug(element.name, element.declaration)}` : '');
    }

    public getTypePath(type: string): string|undefined {
        const name = type.split('.').at(0)!;
        const prop = type.split('.').at(1)!;
        if (!prop) return;

        const found = this.findDeclarationWithElement(name, prop);

        return found
            ? this.getDeclarationPath(
                found.symbol.name,
                found.declaration,
                found.element
                    ? { name: prop, declaration: found.element }
                    : null
            )
            : undefined;
    }

    public getSymbolPath(symbol: Symbol, declaration?: Declaration): string|undefined {
        declaration ??= symbol.declarations[0];

        if (!declaration) return;

        return this.getDeclarationPath(symbol.name, declaration);
    }

    public findDeclarationWithElement(name: string, elementName: string, kind?: DocNodeKind): { symbol: Symbol; declaration: Declaration; element: Documentation.DeclarationElement|null; }|null {
        const data = this.getDeclarations(kind)[name].find(({ declaration }) => !!this.getDeclarationElement(declaration, elementName));

        if (!data) return null;

        return {
            symbol: data.symbol,
            declaration: data.declaration,
            element: this.getDeclarationElement(data.declaration, elementName)
        };
    }

    public getDeclarationElement(declaration: Declaration, elementName: string): Documentation.DeclarationElement|null {
        switch (declaration.kind) {
            case 'class':
            case 'interface':
                return declaration.def.properties?.find(prop => prop.name === elementName)
                    ?? declaration.def.methods?.find(method => method.name === elementName)
                    ?? null;
            case 'namespace':
                return declaration.def.elements.find(prop => prop.name === elementName) ?? null;
            case 'enum':
                return getEnumMembers(declaration).find(prop => prop.name === elementName) ?? null;
        }

        return null;
    }

    public async fetch(fetch: Documentation.FetchClient = Documentation.defaultFetch): Promise<this> {
        const { files } = await Documentation.fetchFiles(false, fetch);

        const file = files.find(file => file.path === path.join(this.package, `${this.tag}.json`));
        const filePath = file?.path ?? `${this.package}/${this.tag}.json`;

        const content: Documentation.APIDocJSONResponse = await fetch(`https://ungh.cc/repos/${path.join(Documentation.repo)}/files/${Documentation.repository.branch}/${filePath}`)
            .then(res => res.json());

        this.symbols = Object.values(content.nodes).map(n => n.symbols).flat();
        this.readme = content.readme || '';

        return this;
    }

    public static async fetchTags(pkg: string, fetch?: Documentation.FetchClient): Promise<string[]> {
        const { files } = await this.fetchFiles(false, fetch);

        return filterAndSortTags(
            files
                .filter(file => file.path.startsWith(pkg))
                .map(file => path.basename(file.path).replace('.json', ''))
        );
    }

    public static async fetchPackages(fetch?: Documentation.FetchClient): Promise<string[]> {
        await this.fetchFiles(false, fetch);

        return Documentation.packages;
    }

    public static async fetchFiles(force: boolean = false, fetch: Documentation.FetchClient = Documentation.defaultFetch): Promise<Documentation.APIFilesResponse> {
        if (Documentation.files && !force) {
            return Documentation.files;
        }

        const files = await fetch(`https://ungh.cc/repos/${path.join(Documentation.repo)}/files/${Documentation.repository.branch}/`)
            .then(async res => res.json())

        Documentation.files = files;

        return files;
    }
}

export namespace Documentation {
    export const defaultFetch = fetch;

    export type FetchClient = typeof fetch;
    export type DeclarationElement = ClassMethodDef|ClassPropertyDef|InterfaceMethodDef|InterfacePropertyDef|EnumMemberDef|Declaration|Symbol;

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
        nodes: Record<string, Document>;
    }

    export type DeclarationFromKind<K extends DocNodeKind> = Extract<Declaration, { kind: K }>;
    export type JsDocTagByKind<K extends JsDocTagKind> = Extract<JsDoc['tags'], { kind: K }>;
}
