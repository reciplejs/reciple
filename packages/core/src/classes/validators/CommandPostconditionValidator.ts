import { CommandPostconditionReason, CommandType } from '../../helpers/constants.js';
import type { CommandPostcondition } from '../structures/CommandPostcondition.js';
import { Validator } from './Validator.js';

export class CommandPostconditionValidator extends Validator {
    public static id = CommandPostconditionValidator.s.string();
    public static scope = CommandPostconditionValidator.s.nativeEnum(CommandType).array().optional();
    public static accepts = CommandPostconditionValidator.s.nativeEnum(CommandPostconditionReason).array().optional();
    public static execute = CommandPostconditionValidator.s.instance(Function);
    public static object = CommandPostconditionValidator.s.object({
        id: CommandPostconditionValidator.id,
        scope: CommandPostconditionValidator.scope,
        execute: CommandPostconditionValidator.execute
    });

    public static resolvable = CommandPostconditionValidator.s.union([CommandPostconditionValidator.object, CommandPostconditionValidator.jsonEncodable]);

    public static isValidId(id: unknown): asserts id is string {
        CommandPostconditionValidator.id.setValidationEnabled(CommandPostconditionValidator.isValidationEnabled).parse(id);
    }

    public static isValidScope(scope: unknown): asserts scope is CommandType[] {
        CommandPostconditionValidator.scope.setValidationEnabled(CommandPostconditionValidator.isValidationEnabled).parse(scope);
    }

    public static isValidAccepts(accepts: unknown): asserts accepts is CommandPostconditionReason[] {
        CommandPostconditionValidator.accepts.setValidationEnabled(CommandPostconditionValidator.isValidationEnabled).parse(accepts);
    }

    public static isValidExecute(execute: unknown): asserts execute is Function {
        CommandPostconditionValidator.execute.setValidationEnabled(CommandPostconditionValidator.isValidationEnabled).parse(execute);
    }

    public static isValid(value: unknown): asserts value is CommandPostcondition.Data {
        const data = value as CommandPostcondition.Data;

        CommandPostconditionValidator.isValidId(data.id);
        CommandPostconditionValidator.isValidScope(data.scope);
        CommandPostconditionValidator.isValidAccepts(data.accepts);
        CommandPostconditionValidator.isValidExecute(data.execute);
    }
}
