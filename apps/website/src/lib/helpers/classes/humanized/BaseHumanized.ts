import type { DocNode } from '@deno/doc';
import type { Documentation } from '../Documentation.svelte';

export abstract class BaseHumanized {
    public tokens: BaseHumanized.AnyToken[] = [];
    public documentation: Documentation|null;

    constructor(options?: BaseHumanized.Options) {
        this.documentation = options?.documentation ?? null;
    }

    public abstract humanize(...args: any): this;

    public toString(): string {
        return BaseHumanized.stringifyTokens(this.tokens);
    }

    protected getTypeLink(type: string|DocNode, withProp?: boolean): string|undefined {
        let node: DocNode|null = null;
        let name = '';
        let prop = '';

        if (typeof type === 'string') {
            name = type.split('.')[0];
            prop = type.split('.')[1];
            node = (prop ? this.documentation?.findProperty(name, prop) : this.documentation?.find(name)) ?? null;
        } else {
            node = type;
        }

        const href = node ? this.documentation?.resolveNodeLink(node) : undefined;

        return href ? href + (withProp ? `#${prop}` : '') : undefined;
    }

    protected addToken(token: BaseHumanized.AnyToken|BaseHumanized|(BaseHumanized.AnyToken|BaseHumanized)[], removeLeadingSpace: boolean = false) {
        if (!removeLeadingSpace && this.tokens.length) this.tokens.push(' ');

        this.tokens.push(
            ...(Array.isArray(token) ? token : [token])
                .map(t => t instanceof BaseHumanized ? t.tokens : t)
                .flat()
        );
    }

    protected normalizeBracketedName(name: string): string {
        return name.startsWith('[') && name.endsWith(']')
            ? name.slice(1, -1)
            : name
    }
}

export namespace BaseHumanized {
    export interface Options {
        documentation?: Documentation|null;
    }

    export type AnyToken = string|Token;

    export interface Token {
        value: string;
        href?: string;
    }

    export function stringifyTokens(tokens: AnyToken[]): string {
        return tokens
            .map(t => typeof t === 'string'
                ? t
                : t instanceof BaseHumanized
                    ? t.toString()
                    : t.value
            ).join('');
    }
}
