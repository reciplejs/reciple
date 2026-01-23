import { s, type Shapes } from '@sapphire/shapeshift';
import { ApplicationCommandType, isValidationEnabled } from 'discord.js';

export class Validator {
    public static readonly s: Shapes = s;
    public static _isValidationEnabled: boolean|null = null;

    public static nameRegex = /^[\p{Ll}\p{Lm}\p{Lo}\p{N}\p{sc=Devanagari}\p{sc=Thai}_-]+$/u;

    public static isValidationEnabled(): boolean {
        return Validator._isValidationEnabled ?? isValidationEnabled();
    }

    public static setValidationEnabled(enabled?: boolean|null): void {
        Validator._isValidationEnabled = enabled ?? null;
    }

    public static jsonEncodable = Validator.s.object({
        toJSON: Validator.s.instance(Function)
    });

    public static baseApplicationCommand = Validator.s.object({
        type: Validator.s.nativeEnum(ApplicationCommandType),
        name: Validator.s.string()
    })
}
