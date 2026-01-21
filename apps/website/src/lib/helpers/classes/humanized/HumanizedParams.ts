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

    public addParamTypes(param: ParamDef): this {
        if ('optional' in param && param.optional) this.addToken('?', true);

        if (param.tsType) {
            this.addToken(':', true);
            this.addToken(new HumanizedTypeDef(this).humanize(param.tsType));
        }

        return this;
    }

    public humanizeParam(param: ParamDef, removeLeadingSpace = false, removeTypes = false): this {
        switch (param.kind) {
            case 'identifier':
                this.addToken(param.name, removeLeadingSpace);

                if (!removeTypes) {
                    this.addParamTypes(param);
                }
                break;
            case 'object':
                this.humanizeParamObject(param, removeLeadingSpace);

                if (!removeTypes) {
                    this.addParamTypes(param);
                }
                break;
            case 'array':
                this.humanizeParamArray(param, removeLeadingSpace);

                if (!removeTypes) {
                    this.addParamTypes(param);
                }
                break;
            case 'assign':
                this.humanizeParam(param.left, removeLeadingSpace, removeTypes);

                if (!removeTypes) {
                    this.addParamTypes(param);
                }

                const assignedValue = this.normalizeBracketedName(param.right);

                if (assignedValue) {
                    this.addToken('=');
                    this.addToken(assignedValue === 'UNSUPPORTED' ? '{}' : assignedValue);
                }
                break;
            case 'rest':
                this.addToken('...', true);
                this.humanizeParam(param.arg, removeLeadingSpace, removeTypes);

                if (!removeTypes) {
                    this.addParamTypes(param);
                }
                break;
        }

        return this;
    }

    public humanizeParamObject(param: ParamObjectDef, removeLeadingSpace = false): this {
        this.addToken('{', removeLeadingSpace);

        for (const j in param.props) {
            const prop = param.props[Number(j)];

            switch (prop.kind) {
                case 'assign':
                    this.addToken(prop.key);

                    if (prop.value) {
                        this.addToken('=');
                        this.addToken(prop.value ?? 'unknown');
                    }
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

            if (param.props.length > 1 && Number(j) < param.props.length - 1) {
                this.addToken([',', ' '], true);
            }
        }

        this.addToken('}');
        return this;
    }

    public humanizeParamArray(param: ParamArrayDef, removeLeadingSpace: boolean = false): this {
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

        return this;
    }
}
