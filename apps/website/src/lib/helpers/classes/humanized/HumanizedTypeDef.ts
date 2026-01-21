import type { TsTypeDef } from '@deno/doc';
import { BaseHumanized } from './BaseHumanized';
import { HumanizedTypeParams } from './HumanizedTypeParams';
import { HumanizedParams } from './HumanizedParams';

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
                const typeRefName = this.normalizeBracketedName(type.typeRef.typeName);

                this.addToken({ value: typeRefName, href: this.documentation?.getTypeLink(typeRefName) });

                if (type.typeRef.typeParams?.length) {
                    this.addToken(new HumanizedTypeParams(this).humanize(type.typeRef.typeParams), true);
                }
                break;
            case 'union':
            case 'intersection':
                const nOru = type.kind === 'union' ? type.union : type.intersection;

                for (const i in nOru) {
                    const subType = nOru[Number(i)];

                    this.addToken(new HumanizedTypeDef(this).humanize(subType), true);

                    if (nOru.length > 1 && Number(i) < nOru.length - 1) {
                        this.addToken(type.kind === 'union' ? '|' : '&', true);
                    }
                }
                break;
            case 'array':
                this.addToken(new HumanizedTypeDef(this).humanize(type.array));
                this.addToken('[]', true);
                break;
            case 'tuple':
                this.addToken('[');

                for (const i in type.tuple) {
                    const subType = type.tuple[Number(i)];

                    this.addToken(new HumanizedTypeDef(this).humanize(subType));

                    if (type.tuple.length > 1 && Number(i) < type.tuple.length - 1) {
                        this.addToken([',', ' '], true);
                    }
                }

                this.addToken(']');
                break
            case 'conditional':
                this.addToken(new HumanizedTypeDef(this).humanize(type.conditionalType.checkType));
                this.addToken('?');
                this.addToken(new HumanizedTypeDef(this).humanize(type.conditionalType.trueType));
                this.addToken(':');
                this.addToken(new HumanizedTypeDef(this).humanize(type.conditionalType.falseType));
                break;
            case 'typeLiteral':
                this.addToken('{');

                for (const i in type.typeLiteral.properties) {
                    const property = type.typeLiteral.properties[Number(i)];

                    this.addToken(property.name);
                    this.addToken(':', true);

                    if (property.tsType) {
                        this.addToken(new HumanizedTypeDef(this).humanize(property.tsType));
                    } else {
                        this.addToken('unknown');
                    }

                    this.addToken(';', true);
                }

                // TODO: some other literals

                this.addToken('}');
                break;
            case 'parenthesized':
                this.addToken('(');
                this.addToken(new HumanizedTypeDef(this).humanize(type.parenthesized), true);
                this.addToken(')', true);
                break;
            case 'typeOperator':
                this.addToken(type.typeOperator.operator);
                this.addToken(new HumanizedTypeDef(this).humanize(type.typeOperator.tsType));
                break;
            case 'rest':
                this.addToken('...');
                this.addToken(new HumanizedTypeDef(this).humanize(type.rest), true);
                break;
            case 'optional':
                this.addToken(new HumanizedTypeDef(this).humanize(type.optional));
                this.addToken('?', true);
                break;
            case 'this':
                this.addToken('this');
                break;
            case 'typeQuery':
                this.addToken(type.typeQuery);
                break;
            case 'fnOrConstructor':
                if (type.fnOrConstructor.constructor) {
                    this.addToken('new');
                }

                this.addToken([
                    ...(
                        type.fnOrConstructor.typeParams.length
                            ? new HumanizedTypeParams(this).humanize(type.fnOrConstructor.typeParams).tokens
                            : []
                    ),
                    '(',
                    ...new HumanizedParams(this).humanize(type.fnOrConstructor.params).tokens,
                    ')'
                ]);

                if (type.fnOrConstructor.tsType) {
                    this.addToken('=>');
                    this.addToken(new HumanizedTypeDef(this).humanize(type.fnOrConstructor.tsType));
                }
                break;
            case 'importType':
            case 'infer':
            case 'indexedAccess':
            case 'mapped':
            case 'typePredicate':
            default:
                this.addToken(`$${type.kind}`);
                break;
        }

        return this;
    }
}
