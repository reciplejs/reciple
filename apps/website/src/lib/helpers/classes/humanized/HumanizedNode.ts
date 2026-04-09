import type { Declaration, DeclarationClass, DeclarationEnum, DeclarationFunction, DeclarationInterface, DeclarationNamespace, DeclarationTypeAlias, DeclarationVariable, Symbol } from '@deno/doc';
import { BaseHumanized } from './BaseHumanized';
import { HumanizedTypeParams } from './HumanizedTypeParams';
import { HumanizedTypeDef } from './HumanizedTypeDef';
import { HumanizedParams } from './HumanizedParams';

export class HumanizedNode extends BaseHumanized {
    public humanize(symbol: Symbol, type: Declaration): this {
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
                this.humanizeFunction(symbol, type);
                break;
            case 'class':
                this.humanizeClass(symbol, type);
                break;
            case 'variable':
                this.humanizeVariable(symbol, type);
                break;
            case 'enum':
                this.humanizeEnum(symbol, type);
                break;
            case 'typeAlias':
                this.humanizeTypeAlias(symbol, type);
                break;
            case 'namespace':
                this.humanizeNamespace(symbol, type);
                break;
            case 'interface':
                this.humanizeInterface(symbol, type);
                break;
                break;
        }

        return this;
    }

    public humanizeFunction(symbol: Symbol, type: DeclarationFunction): void {
        if (type.def.isAsync) this.addToken('async');

        this.addToken(type.def.isGenerator ? 'function*' : 'function');
        this.addToken({ value: symbol.name, href: this.documentation?.getSymbolPath(symbol, type) });

        if (type.def.typeParams?.length) {
            this.addToken(new HumanizedTypeParams(this).humanize(type.def.typeParams), true);
        }

        this.addToken(new HumanizedParams(this).humanize(type.def.params), true);

        if (type.def.returnType) {
            this.addToken(':', true);
            this.addToken(new HumanizedTypeDef(this).humanize(type.def.returnType));
        }
    }

    public humanizeClass(symbol: Symbol, type: DeclarationClass): void {
        if (type.def.isAbstract) this.addToken('abstract');

        this.addToken('class');
        this.addToken({ value: symbol.name, href: this.documentation?.getSymbolPath(symbol, type) });

        if (type.def.typeParams?.length) {
            this.addToken(new HumanizedTypeParams(this).humanize(type.def.typeParams), true);
        }

        if (type.def.extends) {
            this.addToken('extends');
            this.addToken({ value: type.def.extends, href: this.documentation?.getSymbolPath(symbol, type) });
        }

        if (type.def.implements?.length) {
            this.addToken('implements');

            for (const i in type.def.implements) {
                this.addToken(new HumanizedTypeDef(this).humanize(type.def.implements[Number(i)]), Number(i) > 0);

                if (Number(i) < type.def.implements.length - 1) {
                    this.addToken([',', ' '], true);
                }
            }
        }
    }

    public humanizeVariable(symbol: Symbol, type: DeclarationVariable): void {
        this.addToken(type.def.kind);
        this.addToken({ value: symbol.name, href: this.documentation?.getSymbolPath(symbol, type) });

        if (type.def.tsType) {
            this.addToken(':', true);
            this.addToken(new HumanizedTypeDef(this).humanize(type.def.tsType));
        }
    }

    public humanizeEnum(symbol: Symbol, type: DeclarationEnum): void {
        this.addToken('enum');
        this.addToken({ value: symbol.name, href: this.documentation?.getSymbolPath(symbol, type) });
        // Doesn't support multi line
    }

    public humanizeTypeAlias(symbol: Symbol, type: DeclarationTypeAlias): void {
        this.addToken('type');
        this.addToken({ value: symbol.name, href: this.documentation?.getSymbolPath(symbol, type) });

        if (type.def.typeParams?.length) {
            this.addToken(new HumanizedTypeParams(this).humanize(type.def.typeParams), true);
        }

        this.addToken('=');
        this.addToken(new HumanizedTypeDef(this).humanize(type.def.tsType));
    }

    public humanizeNamespace(symbol: Symbol, type: DeclarationNamespace): void {
        this.addToken('namespace');
        this.addToken({ value: symbol.name, href: this.documentation?.getSymbolPath(symbol, type) });
        // Doesn't support multi line
    }

    public humanizeInterface(symbol: Symbol, type: DeclarationInterface): void {
        this.addToken('interface');
        this.addToken({ value: symbol.name, href: this.documentation?.getSymbolPath(symbol, type) });

        if (type.def.typeParams?.length) {
            this.addToken(new HumanizedTypeParams(this).humanize(type.def.typeParams), true);
        }

        if (type.def.extends?.length) {
            this.addToken('extends');

            for (const i in type.def.extends) {
                this.addToken(new HumanizedTypeDef(this).humanize(type.def.extends[Number(i)]), Number(i) > 0);

                if (Number(i) < type.def.extends.length - 1) {
                    this.addToken([',', ' '], true);
                }
            }
        }
        // Doesn't support multi line
    }
}

export namespace HumanizedNode {
    export const nodeKinds = ["function", "moduleDoc", "variable", "enum", "class", "typeAlias", "namespace", "interface", "import"];
}
