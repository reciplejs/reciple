import { CommandPostconditionReason, CommandType, Validator } from '@reciple/core';
import { BaseModuleValidator } from './BaseModuleValidator.js';
import type { PostconditionModule } from '../modules/PostconditionModule.js';

export class PostconditionModuleValidator extends Validator {
    public static scope = Validator.s.nativeEnum(CommandType).array().optional();
    public static accepts = Validator.s.nativeEnum(CommandPostconditionReason).array().optional();
    public static execute = Validator.s.instance(Function);

    public static object = Validator.s.object({
        scope: PostconditionModuleValidator.scope,
        execute: PostconditionModuleValidator.execute
    });

    public static resolvable = Validator.s.union([PostconditionModuleValidator.object, PostconditionModuleValidator.jsonEncodable]);

    public static isValidScope(scope: unknown): asserts scope is CommandType[] {
        PostconditionModuleValidator.scope.setValidationEnabled(PostconditionModuleValidator.isValidationEnabled).parse(scope);
    }

    public static isValidAccepts(accepts: unknown): asserts accepts is CommandPostconditionReason[] {
        PostconditionModuleValidator.accepts.setValidationEnabled(PostconditionModuleValidator.isValidationEnabled).parse(accepts);
    }

    public static isValidExecute(execute: unknown): asserts execute is (...args: unknown[]) => Promise<void> {
        PostconditionModuleValidator.execute.setValidationEnabled(PostconditionModuleValidator.isValidationEnabled).parse(execute);
    }

    public static isValid(value: unknown): asserts value is PostconditionModule.Data {
        const data = value as PostconditionModule.Data;

        BaseModuleValidator.isValid(data);
        PostconditionModuleValidator.isValidScope(data.scope);
        PostconditionModuleValidator.isValidAccepts(data.accepts);
        PostconditionModuleValidator.isValidExecute(data.execute);
    }
}
