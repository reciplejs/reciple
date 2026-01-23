import { Validator } from '@reciple/core';
import { ModuleType } from '../../helpers/constants.js';
import type { AnyModuleData } from '../../helpers/types.js';

export class BaseModuleValidator extends Validator {
    public static id = BaseModuleValidator.s.string().lengthGreaterThan(0);
    public static moduleType = BaseModuleValidator.s.nativeEnum(ModuleType);
    public static onEnable = BaseModuleValidator.s.instance(Function).optional();
    public static onReady = BaseModuleValidator.s.instance(Function).optional();
    public static onDisable = BaseModuleValidator.s.instance(Function).optional();

    public static object = BaseModuleValidator.s.object({
        id: BaseModuleValidator.id.optional(),
        moduleType: BaseModuleValidator.moduleType.optional(),
        onEnable: BaseModuleValidator.onEnable,
        onReady: BaseModuleValidator.onReady,
        onDisable: BaseModuleValidator.onDisable
    });

    public static resolvable = BaseModuleValidator.s.union([
        BaseModuleValidator.object,
        BaseModuleValidator.jsonEncodable
    ]);

    public static isValidId(id: unknown): asserts id is string {
        BaseModuleValidator.id.setValidationEnabled(BaseModuleValidator.isValidationEnabled).parse(id);
    }

    public static isValidModuleType(moduleType: unknown): asserts moduleType is ModuleType {
        BaseModuleValidator.moduleType.setValidationEnabled(BaseModuleValidator.isValidationEnabled).parse(moduleType);
    }

    public static isValidOnEnable(onEnable: unknown): asserts onEnable is () => Promise<void> {
        BaseModuleValidator.onEnable.setValidationEnabled(BaseModuleValidator.isValidationEnabled).parse(onEnable);
    }

    public static isValidOnReady(onReady: unknown): asserts onReady is () => Promise<void> {
        BaseModuleValidator.onReady.setValidationEnabled(BaseModuleValidator.isValidationEnabled).parse(onReady);
    }

    public static isValidOnDisable(onDisable: unknown): asserts onDisable is () => Promise<void> {
        BaseModuleValidator.onDisable.setValidationEnabled(BaseModuleValidator.isValidationEnabled).parse(onDisable);
    }

    public static isValid(value: unknown): asserts value is AnyModuleData {
        const data = value as AnyModuleData;

        if ('id' in data) BaseModuleValidator.isValidId(data.id);
        if ('moduleType' in data) BaseModuleValidator.isValidModuleType(data.moduleType);

        BaseModuleValidator.isValidOnEnable(data.onEnable);
        BaseModuleValidator.isValidOnReady(data.onReady);
        BaseModuleValidator.isValidOnDisable(data.onDisable);
    }
}
