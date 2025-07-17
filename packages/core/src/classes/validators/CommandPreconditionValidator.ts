import { CommandType } from '../../helpers/constants.js';
import type { CommandPrecondition } from '../structures/CommandPrecondition.js';
import { Validator } from './Validator.js';

export class CommandPreconditionValidator extends Validator {
    public static id = CommandPreconditionValidator.s.string();
    public static scope = CommandPreconditionValidator.s.nativeEnum(CommandType).array().optional();
    public static execute = CommandPreconditionValidator.s.instance(Function);
    public static object = CommandPreconditionValidator.s.object({
        id: CommandPreconditionValidator.id,
        scope: CommandPreconditionValidator.scope,
        execute: CommandPreconditionValidator.execute
    });

    public static resolvable = CommandPreconditionValidator.s.union([CommandPreconditionValidator.object, CommandPreconditionValidator.jsonEncodable]);

    public static isValidId(id: unknown): asserts id is string {
        CommandPreconditionValidator.id.setValidationEnabled(CommandPreconditionValidator.isValidationEnabled).parse(id);
    }

    public static isValidScope(scope: unknown): asserts scope is CommandType[] {
        CommandPreconditionValidator.scope.setValidationEnabled(CommandPreconditionValidator.isValidationEnabled).parse(scope);
    }

    public static isValidExecute(execute: unknown): asserts execute is Function {
        CommandPreconditionValidator.execute.setValidationEnabled(CommandPreconditionValidator.isValidationEnabled).parse(execute);
    }

    public static isValid(value: unknown): asserts value is CommandPrecondition.Data {
        const data = value as CommandPrecondition.Data;

        CommandPreconditionValidator.isValidId(data.id);
        CommandPreconditionValidator.isValidScope(data.scope);
        CommandPreconditionValidator.isValidExecute(data.execute);
    }
}
