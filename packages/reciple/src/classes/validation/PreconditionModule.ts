import { CommandType, Validator } from '@reciple/core';
import type { PreconditionModule } from '../modules/PreconditionModule.js';
import { BaseModuleValidator } from './BaseModuleValidator.js';

export class PreconditionModuleValidator extends Validator {
    public static scope = Validator.s.nativeEnum(CommandType).array().optional();
    public static execute = Validator.s.instance(Function);

    public static object = Validator.s.object({
        scope: PreconditionModuleValidator.scope,
        execute: PreconditionModuleValidator.execute
    });

    public static resolvable = Validator.s.union([PreconditionModuleValidator.object, PreconditionModuleValidator.jsonEncodable]);

    public static isValidScope(scope: unknown): asserts scope is CommandType[] {
        PreconditionModuleValidator.scope.setValidationEnabled(PreconditionModuleValidator.isValidationEnabled).parse(scope);
    }

    public static isValidExecute(execute: unknown): asserts execute is (...args: unknown[]) => Promise<void> {
        PreconditionModuleValidator.execute.setValidationEnabled(PreconditionModuleValidator.isValidationEnabled).parse(execute);
    }

    public static isValid(value: unknown): asserts value is PreconditionModule.Data {
        const data = value as PreconditionModule.Data;

        BaseModuleValidator.isValid(data);
        PreconditionModuleValidator.isValidScope(data.scope);
        PreconditionModuleValidator.isValidExecute(data.execute);
    }
}
