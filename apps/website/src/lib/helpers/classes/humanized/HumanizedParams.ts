import type { ParamArrayDef, ParamDef, ParamObjectDef } from '@deno/doc';
import { BaseHumanized } from './BaseHumanized';
import { HumanizedTypeDef } from './HumanizedTypeDef';

export class HumanizedParams extends BaseHumanized {
    public humanize(params: ParamDef[]): this {
        this.addToken('(');

        for (const i in params) {
            const param = params[Number(i)];

            this.humanizeParam(param, true);

            if (params.length > 1 && Number(i) < params.length - 1) {
                this.addToken([',', ' '], true);
            }
        }

        this.addToken(')', true);

        return this;
    }

    public addParamTypes(param: ParamDef): void {
        if ('optional' in param && param.optional) this.addToken('?', true);

        if (param.tsType) {
            this.addToken(':', true);
            this.addToken(new HumanizedTypeDef(this).humanize(param.tsType));
        }
    }

    public humanizeParam(param: ParamDef, removeLeadingSpace = false): void {
        switch (param.kind) {
            case 'identifier':
                this.addToken(param.name, removeLeadingSpace);
                this.addParamTypes(param);
                break;
            case 'object':
                this.humanizeParamObject(param, removeLeadingSpace);
                break;
            case 'array':
                this.humanizeParamArray(param, removeLeadingSpace);
                break;
            case 'assign':
                this.humanizeParam(param.left, removeLeadingSpace);
                this.addParamTypes(param);
                this.addToken('=');
                this.addToken(this.normalizeBracketedName(param.right));
                break;
            case 'rest':
        }
    }

    public humanizeParamObject(param: ParamObjectDef, removeLeadingSpace = false): void {
        this.addToken('{', removeLeadingSpace);

        for (const j in param.props) {
            const prop = param.props[Number(j)];

            switch (prop.kind) {
                case 'assign':
                    this.addToken(prop.key);
                    this.addToken('=', true);
                    this.addToken(prop.value ?? 'unknown');
                    break;
                case 'rest':
                    this.addToken('...');
                    this.humanizeParam(prop.arg);
                    break;
                case 'keyValue':
                    this.addToken(prop.key);
                    this.addToken(':');
                    this.humanizeParam(prop.value);
                    break;
            }
        }

        this.addToken('}', true);
        this.addParamTypes(param);
    }

    public humanizeParamArray(param: ParamArrayDef, removeLeadingSpace: boolean = false): void {
        this.addToken('[', removeLeadingSpace);

        for (const i in param.elements) {
            const element = param.elements[Number(i)];

            if (!element) {
                this.addToken('unknown', true);
            } else {
                this.humanizeParam(element);
            }

            if (param.elements.length > 1 && Number(i) < param.elements.length - 1) {
                this.addToken([',', ' '], true);
            }
        }

        this.addToken(']', true);
    }
}
