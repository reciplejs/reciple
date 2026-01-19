import type { TsTypeDef } from '@deno/doc';
import { BaseHumanized } from './BaseHumanized';
import { HumanizedTypeParams } from './HumanizedTypeParams';

export class HumanizedTypeDef extends BaseHumanized {
    public humanize(type: TsTypeDef): this {
        switch (type.kind) {
            case 'keyword':
                this.addToken(type.keyword);
                break;
            case 'literal':
                this.addToken(type.literal.kind === 'string' ? `"${type.literal.string}"` : type.repr);
                break;
            case 'typeRef':
                const typeRefName = type.typeRef.typeName.startsWith('[') && type.typeRef.typeName.endsWith(']')
                    ? type.typeRef.typeName.slice(1, -1)
                    : type.typeRef.typeName;

                this.addToken({ value: typeRefName, href: this.getTypeLink(typeRefName, true) });

                if (type.typeRef.typeParams?.length) {
                    this.addToken(new HumanizedTypeParams(this).humanize(type.typeRef.typeParams), true);
                }
                break;
            case 'union':
            case 'intersection':
                const nOru = type.kind === 'union' ? type.union : type.intersection;

                for (const i in nOru) {
                    const subType = nOru[Number(i)];

                    this.humanize(subType);

                    if (nOru.length > 1 && Number(i) < nOru.length - 1) {
                        this.addToken(type.kind === 'union' ? '|' : '&', true);
                    }
                }
                break;
            case 'array':
                this.humanize(type.array);
                this.addToken('[]');
                break;
            case 'tuple':
                this.addToken('[');

                for (const i in type.tuple) {
                    const subType = type.tuple[Number(i)];

                    this.humanize(subType);

                    if (type.tuple.length > 1 && Number(i) < type.tuple.length - 1) {
                        this.addToken([',', ' '], true);
                    }
                }

                this.addToken(']');
                break
            case 'conditional':
                this.humanize(type.conditionalType.checkType);
                this.addToken('?');
                this.humanize(type.conditionalType.trueType);
                this.addToken(':');
                this.humanize(type.conditionalType.falseType);
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
}
