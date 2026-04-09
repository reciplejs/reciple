import type { TsTypeDef } from '@deno/doc';
import { BaseHumanized } from './BaseHumanized';
import { HumanizedTypeParams } from './HumanizedTypeParams';
import { HumanizedParams } from './HumanizedParams';

export class HumanizedTypeDef extends BaseHumanized {
    public humanize(type: TsTypeDef): this {
        switch (type.kind) {
            case 'keyword':
                this.addToken(type.value);
                break;
            case 'literal':
                this.addToken(type.value.kind === 'string' ? `"${type.value.string}"` : type.repr ?? '');
                break;
            case 'typeRef':
                const typeRefName = this.normalizeBracketedName(type.value.typeName);

                this.addToken({ value: typeRefName, href: this.documentation?.getTypePath(typeRefName) });

                if (type.value.typeParams?.length) {
                    this.addToken(new HumanizedTypeParams(this).humanize(type.value.typeParams), true);
                }
                break;
            case 'union':
            case 'intersection':
                for (const i in type.value) {
                    const subType = type.value[Number(i)];

                    this.addToken(new HumanizedTypeDef(this).humanize(subType), true);

                    if (type.value.length > 1 && Number(i) < type.value.length - 1) {
                        this.addToken(type.kind === 'union' ? '|' : '&', true);
                    }
                }
                break;
            case 'array':
                this.addToken(new HumanizedTypeDef(this).humanize(type.value));
                this.addToken('[]', true);
                break;
            case 'tuple':
                this.addToken('[');

                for (const i in type.value) {
                    const subType = type.value[Number(i)];

                    this.addToken(new HumanizedTypeDef(this).humanize(subType));

                    if (type.value.length > 1 && Number(i) < type.value.length - 1) {
                        this.addToken([',', ' '], true);
                    }
                }

                this.addToken(']');
                break
            case 'conditional':
                this.addToken(new HumanizedTypeDef(this).humanize(type.value.checkType));
                this.addToken('?');
                this.addToken(new HumanizedTypeDef(this).humanize(type.value.trueType));
                this.addToken(':');
                this.addToken(new HumanizedTypeDef(this).humanize(type.value.falseType));
                break;
            case 'typeLiteral':
                this.addToken('{');

                for (const i in type.value.properties) {
                    const property = type.value.properties[Number(i)];

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
                this.addToken(new HumanizedTypeDef(this).humanize(type.value), true);
                this.addToken(')', true);
                break;
            case 'typeOperator':
                this.addToken(type.value.operator);
                this.addToken(new HumanizedTypeDef(this).humanize(type.value.tsType));
                break;
            case 'rest':
                this.addToken('...');
                this.addToken(new HumanizedTypeDef(this).humanize(type.value), true);
                break;
            case 'optional':
                this.addToken(new HumanizedTypeDef(this).humanize(type.value));
                this.addToken('?', true);
                break;
            case 'this':
                this.addToken('this');
                break;
            case 'typeQuery':
                this.addToken(type.value);
                break;
            case 'fnOrConstructor':
                if (type.value.constructor) {
                    this.addToken('new');
                }

                this.addToken([
                    ...(
                        type.value.typeParams && type.value.typeParams.length
                            ? new HumanizedTypeParams(this).humanize(type.value.typeParams).tokens
                            : []
                    ),
                    '(',
                    ...new HumanizedParams(this).humanize(type.value.params).tokens,
                    ')'
                ]);

                if (type.value.tsType) {
                    this.addToken('=>');
                    this.addToken(new HumanizedTypeDef(this).humanize(type.value.tsType));
                }
                break;
            case 'typePredicate':
                if (type.value.asserts) {
                    this.addToken('asserts');
                }

                this.addToken(type.value.param.type === 'identifier' ? type.value.param.name ?? 'this' : 'this');
                this.addToken('is');
                this.addToken(type.value.type ? new HumanizedTypeDef(this).humanize(type.value.type) : 'unknown');
                break;
            case 'indexedAccess':
                this.addToken(new HumanizedTypeDef(this).humanize(type.value.objType));
                this.addToken([
                        '[',
                        new HumanizedTypeDef(this).humanize(type.value.indexType),
                        ']'
                    ],
                    true
                );
                break;
            case 'infer':
                this.addToken('infer');
                this.addToken(new HumanizedTypeParams(this).humanize([type.value.typeParam], true));
                break;
            case 'mapped':
                if (type.value.readonly) {
                    this.addToken(
                        `${typeof type.value.readonly === 'string' ? type.value.readonly : ''}readonly`
                    );
                }

                this.addToken([
                    '[',
                    new HumanizedTypeParams(this).humanize([type.value.typeParam], true),
                    ...(type.value.nameType
                        ? [
                            ' ', 'as', ' ',
                            new HumanizedTypeDef(this).humanize(type.value.nameType)
                        ]
                        : []
                    ),
                    ']'
                ]);

                if (type.value.optional) {
                    this.addToken(
                        `${typeof type.value.optional === 'string' ? type.value.optional : ''}optional`
                        , true
                    );
                }
                break;
            case 'importType':
            default:
                this.addToken(`$${type.kind}`);
                break;
        }

        return this;
    }
}
