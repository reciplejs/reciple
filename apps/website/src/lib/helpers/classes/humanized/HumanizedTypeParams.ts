import type { TsTypeDef, TsTypeParamDef } from '@deno/doc';
import { BaseHumanized } from './BaseHumanized';
import { HumanizedTypeDef } from './HumanizedTypeDef';

export class HumanizedTypeParams extends BaseHumanized {
    public humanize(typeParams: (TsTypeParamDef|TsTypeDef)[]): this {
        this.addToken('<');

        for (const i in typeParams) {
            const param = typeParams[Number(i)];

            if ('kind' in param) {
                this.addToken(new HumanizedTypeDef(this).humanize(param), true);
            } else {
                this.addToken(param.name, true);

                if (param.constraint) {
                    this.addToken('extends');
                    this.addToken(new HumanizedTypeDef(this).humanize(param.constraint));
                }
            }

            if (typeParams.length > 1 && Number(i) < typeParams.length - 1) {
                this.addToken([',', ' '], true);
            }
        }

        this.addToken('>', true);
        return this;
    }
}
