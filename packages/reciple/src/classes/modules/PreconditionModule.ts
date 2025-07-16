import { CommandPrecondition, type AnyCommandExecuteData, type CommandType } from '@reciple/core';
import { BaseModule } from './BaseModule.js';
import { hasMixin, mix } from 'ts-mixer';
import { ModuleType } from '../../helpers/constants.js';

export interface PreconditionModule<D = any> extends Omit<BaseModule, 'moduleType'>, CommandPrecondition<D> {}

@mix(BaseModule, CommandPrecondition)
export abstract class PreconditionModule<D = any> implements PreconditionModule<D> {
    public moduleType: ModuleType.Precondition = ModuleType.Precondition;

    public abstract execute<T extends CommandType>(data: AnyCommandExecuteData<T>): Promise<CommandPrecondition.ResultDataResolvable<T, D>>;

    public static from<D>(data: PreconditionModule.Resolvable<D>): PreconditionModule<D> {
        if (data instanceof PreconditionModule || hasMixin(data, PreconditionModule)) return data;

        const ModuleInstance = class extends PreconditionModule { execute = data.execute; };
        Object.assign(ModuleInstance.prototype, data);
        return new ModuleInstance();
    }
}

export namespace PreconditionModule {
    export type Resolvable<D = any> = PreconditionModule<D>|PreconditionModule.Data<D>;

    export interface Data<D = any> extends Omit<BaseModule.Data, 'moduleType'>, CommandPrecondition.Data<D> {
        moduleType: ModuleType.Precondition;
    }
}
