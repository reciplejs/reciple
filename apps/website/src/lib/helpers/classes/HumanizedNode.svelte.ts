import type { DocNode, TsTypeDef, TsTypeParamDef } from '@deno/doc';
import type { Documentation } from './Documentation.svelte';

export class Humanized {
    public tokens: Humanized.AnyToken[] = $state([]);
    public documentation: Documentation|null;

    constructor(options?: Humanized.Options) {
        this.documentation = options?.documentation ?? null;
    }

    public toString() {
        return this.tokens.map(t => typeof t === 'string' ? t : t.value).join('');
    }

    public humanizeNode(type: DocNode): this {
        switch (type.declarationKind) {
            case 'private':
                break;
            case 'export':
            case 'declare':
                this.addToken(type.declarationKind);
                break;
        }

        switch (type.kind) {
            case 'function':
                if (type.functionDef.isAsync) this.addToken('async');

                this.addToken(type.functionDef.isGenerator ? 'function*' : 'function');
                this.addToken({ value: type.name, href: this.getTypeLink(type) });

                if (type.functionDef.typeParams.length) {
                    this.humanizeTypeParams(type.functionDef.typeParams);
                }

                this.addToken('(', true);
                this.addToken(')', true);

                if (type.functionDef.returnType) {
                    this.addToken(':', true);
                    this.humanizeTypeDef(type.functionDef.returnType);
                }

                break;
            case 'class':
                if (type.classDef.isAbstract) this.addToken('abstract');

                this.addToken('class');
                this.addToken({ value: type.name, href: this.getTypeLink(type) });

                if (type.classDef.typeParams.length) {
                    this.humanizeTypeParams(type.classDef.typeParams);
                }

                if (type.classDef.extends) {
                    this.addToken('extends');
                    this.addToken({
                        value: type.classDef.extends,
                        href: this.getTypeLink(type.classDef.extends)
                    });
                }

                if (type.classDef.implements.length) {
                    this.addToken('implements');

                    for (const i in type.classDef.implements) {
                        this.humanizeTypeDef(type.classDef.implements[Number(i)], Number(i) > 0);

                        if (Number(i) < type.classDef.implements.length - 1) {
                            this.addToken([',', ' '], true);
                        }
                    }
                }
                break;
            case 'variable':
                this.addToken(type.variableDef.kind);
                this.addToken({ value: type.name, href: this.getTypeLink(type) });

                if (type.variableDef.tsType) {
                    this.addToken(':', true);
                    this.humanizeTypeDef(type.variableDef.tsType);
                }
                break;
            case 'enum':
                this.addToken('enum');
                this.addToken({ value: type.name, href: this.getTypeLink(type) });
                // Doesn't support multi line
                break;
            case 'typeAlias':
                this.addToken('type');
                this.addToken({ value: type.name, href: this.getTypeLink(type) });

                if (type.typeAliasDef.typeParams.length) {
                    this.humanizeTypeParams(type.typeAliasDef.typeParams);
                }

                this.addToken('=');
                this.humanizeTypeDef(type.typeAliasDef.tsType);
                break;
            case 'namespace':
            case 'interface':
            case 'moduleDoc':
            case 'import':
                break;
        }

        return this;
    }

    public humanizeTypeParams(typeParams: TsTypeParamDef[]) {
        this.addToken('<', true);

        for (const i in typeParams) {
            const param = typeParams[Number(i)];

            this.addToken(param.name, true);

            if (param.constraint) {
                this.addToken('extends');
                this.humanizeTypeDef(param.constraint);
            }

            if (typeParams.length > 1 && Number(i) < typeParams.length - 1) {
                this.addToken([',', ' '], true);
            }
        }

        this.addToken('>', true);
    }

    public humanizeTypeDef(type: TsTypeDef, removeLeadingSpace: boolean = false): this {
        switch (type.kind) {
            case 'keyword':
                this.addToken(type.keyword, removeLeadingSpace);
                break;
            case 'literal':
                this.addToken(type.literal.kind === 'string' ? `"${type.literal.string}"` : type.repr, removeLeadingSpace);
                break;
            case 'typeRef':
                const typeRefName = type.typeRef.typeName.startsWith('[') && type.typeRef.typeName.endsWith(']') ? type.typeRef.typeName.slice(1, -1) : type.typeRef.typeName;

                this.addToken({
                    value: typeRefName,
                    href: this.getTypeLink(typeRefName, true)
                }, removeLeadingSpace);

                if (type.typeRef.typeParams?.length) {
                    this.addToken('<', true);

                    for (const i in type.typeRef.typeParams) {
                        const param = type.typeRef.typeParams[Number(i)];

                        this.humanizeTypeDef(param, true);

                        if (type.typeRef.typeParams.length > 1 && Number(i) < type.typeRef.typeParams.length - 1) {
                            this.addToken([',', ' '], true);
                        }
                    }

                    this.addToken('>', true);
                }
                break;
            case 'union':
            case 'intersection':
                const nOru = type.kind === 'union' ? type.union : type.intersection;

                for (const i in nOru) {
                    const subType = nOru[Number(i)];

                    this.humanizeTypeDef(subType, Number(i) > 0 ? true : removeLeadingSpace);

                    if (nOru.length > 1 && Number(i) < nOru.length - 1) {
                        this.addToken(type.kind === 'union' ? '|' : '&', true);
                    }
                }
                break;
            case 'array':
                this.humanizeTypeDef(type.array, removeLeadingSpace);
                this.addToken('[]');
                break;
            case 'tuple':
                this.addToken('[', removeLeadingSpace);

                for (const i in type.tuple) {
                    const subType = type.tuple[Number(i)];

                    this.humanizeTypeDef(subType, Number(i) > 0);

                    if (type.tuple.length > 1 && Number(i) < type.tuple.length - 1) {
                        this.addToken([',', ' '], true);
                    }
                }

                this.addToken(']');
                break
            case 'conditional':
                this.humanizeTypeDef(type.conditionalType.checkType, removeLeadingSpace);
                this.addToken('?');
                this.humanizeTypeDef(type.conditionalType.trueType);
                this.addToken(':');
                this.humanizeTypeDef(type.conditionalType.falseType);
                break;
            case 'typeOperator':
            case 'parenthesized':
            case 'rest':
            case 'optional':
            case 'typeQuery':
            case 'this':
            case 'fnOrConstructor':
            case 'importType':
            case 'infer':
            case 'indexedAccess':
            case 'mapped':
            case 'typeLiteral':
            case 'typePredicate':
                this.addToken(type.repr);
                break;
        }

        return this;
    }

    private getTypeLink(type: string|DocNode, withProp?: boolean): string|undefined {

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

    private addToken(token: Humanized.AnyToken|Humanized.AnyToken[], removeLeadingSpace: boolean = false) {
        if (!removeLeadingSpace && this.tokens.length) this.tokens.push(' ');

        this.tokens.push(...(Array.isArray(token) ? token : [token]));
    }
}

export namespace Humanized {
    export interface Options {
        documentation?: Documentation;
    }

    export type AnyToken = string|Token;

    export interface Token {
        value: string;
        href?: string;
    }

    export const nodeKinds = ["function", "moduleDoc", "variable", "enum", "class", "typeAlias", "namespace", "interface", "import"];
}
