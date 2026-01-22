import type { DocNode, DocNodeClass, DocNodeEnum, DocNodeFunction, DocNodeInterface, DocNodeNamespace, DocNodeTypeAlias, DocNodeVariable } from '@deno/doc';
import { BaseHumanized } from './BaseHumanized';
import { HumanizedTypeParams } from './HumanizedTypeParams';
import { HumanizedTypeDef } from './HumanizedTypeDef';
import { HumanizedParams } from './HumanizedParams';

export class HumanizedNode extends BaseHumanized {
    public humanize(type: DocNode): this {
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
                this.humanizeFunction(type);
                break;
            case 'class':
                this.humanizeClass(type);
                break;
            case 'variable':
                this.humanizeVariable(type);
                break;
            case 'enum':
                this.humanizeEnum(type);
                break;
            case 'typeAlias':
                this.humanizeTypeAlias(type);
                break;
            case 'namespace':
                this.humanizeNamespace(type);
                break;
            case 'interface':
                this.humanizeInterface(type);
                break;
            case 'moduleDoc':
            case 'import':
                break;
        }

        return this;
    }

    public humanizeFunction(type: DocNodeFunction): void {
        if (type.functionDef.isAsync) this.addToken('async');

        this.addToken(type.functionDef.isGenerator ? 'function*' : 'function');
        this.addToken({ value: type.name, href: this.documentation?.getTypeLink(type) });

        if (type.functionDef.typeParams.length) {
            this.addToken(new HumanizedTypeParams(this).humanize(type.functionDef.typeParams), true);
        }

        this.addToken(new HumanizedParams(this).humanize(type.functionDef.params), true);

        if (type.functionDef.returnType) {
            this.addToken(':', true);
            this.addToken(new HumanizedTypeDef(this).humanize(type.functionDef.returnType));
        }
    }

    public humanizeClass(type: DocNodeClass): void {
        if (type.classDef.isAbstract) this.addToken('abstract');

        this.addToken('class');
        this.addToken({ value: type.name, href: this.documentation?.getTypeLink(type) });

        if (type.classDef.typeParams.length) {
            this.addToken(new HumanizedTypeParams(this).humanize(type.classDef.typeParams), true);
        }

        if (type.classDef.extends) {
            this.addToken('extends');
            this.addToken({ value: type.classDef.extends, href: this.documentation?.getTypeLink(type.classDef.extends) });
        }

        if (type.classDef.implements.length) {
            this.addToken('implements');

            for (const i in type.classDef.implements) {
                this.addToken(new HumanizedTypeDef(this).humanize(type.classDef.implements[Number(i)]), Number(i) > 0);

                if (Number(i) < type.classDef.implements.length - 1) {
                    this.addToken([',', ' '], true);
                }
            }
        }
    }

    public humanizeVariable(type: DocNodeVariable): void {
        this.addToken(type.variableDef.kind);
        this.addToken({ value: type.name, href: this.documentation?.getTypeLink(type) });

        if (type.variableDef.tsType) {
            this.addToken(':', true);
            this.addToken(new HumanizedTypeDef(this).humanize(type.variableDef.tsType));
        }
    }

    public humanizeEnum(type: DocNodeEnum): void {
        this.addToken('enum');
        this.addToken({ value: type.name, href: this.documentation?.getTypeLink(type) });
        // Doesn't support multi line
    }

    public humanizeTypeAlias(type: DocNodeTypeAlias): void {
        this.addToken('type');
        this.addToken({ value: type.name, href: this.documentation?.getTypeLink(type) });

        if (type.typeAliasDef.typeParams.length) {
            this.addToken(new HumanizedTypeParams(this).humanize(type.typeAliasDef.typeParams), true);
        }

        this.addToken('=');
        this.addToken(new HumanizedTypeDef(this).humanize(type.typeAliasDef.tsType));
    }

    public humanizeNamespace(type: DocNodeNamespace): void {
        this.addToken('namespace');
        this.addToken({ value: type.name, href: this.documentation?.getTypeLink(type) });
        // Doesn't support multi line
    }

    public humanizeInterface(type: DocNodeInterface): void {
        this.addToken('interface');
        this.addToken({ value: type.name, href: this.documentation?.getTypeLink(type) });

        if (type.interfaceDef.typeParams.length) {
            this.addToken(new HumanizedTypeParams(this).humanize(type.interfaceDef.typeParams), true);
        }

        if (type.interfaceDef.extends.length) {
            this.addToken('extends');

            for (const i in type.interfaceDef.extends) {
                this.addToken(new HumanizedTypeDef(this).humanize(type.interfaceDef.extends[Number(i)]), Number(i) > 0);

                if (Number(i) < type.interfaceDef.extends.length - 1) {
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
