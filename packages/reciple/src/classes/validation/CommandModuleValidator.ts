import { BaseModuleValidator } from './BaseModuleValidator.js';
import { BaseCommandValidator, Validator } from '@reciple/core';
import type { AnyCommandModuleData } from '../../helpers/types.js';

export class CommandModuleValidator extends Validator {
    public static object = BaseModuleValidator.object.extend(BaseCommandValidator.object);
    public static resolvable = Validator.s.union([CommandModuleValidator.object, Validator.jsonEncodable]);

    public static isValid(value: unknown): asserts value is AnyCommandModuleData {
        BaseModuleValidator.isValid(value);
        BaseCommandValidator.isValid(value);
    }
}
