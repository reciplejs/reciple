import { CommandPostcondition, type CommandPrecondition, type CommandType } from '@reciple/core';
import { BaseModule } from './BaseModule.js';
import { hasMixin, mix } from 'ts-mixer';
import { ModuleType } from '../../helpers/constants.js';

export interface PostconditionModule<D = any> extends Omit<BaseModule, 'moduleType'>, CommandPostcondition<D> {}

@mix(CommandPostcondition, BaseModule)
export abstract class PostconditionModule<D = any> implements PostconditionModule<D> {
    public moduleType: ModuleType.Postcondition = ModuleType.Postcondition;

    public abstract execute<T extends CommandType>(data: CommandPostcondition.ExecuteData<T>, preconditionTrigger?: CommandPrecondition.ResultData<T, any>): Promise<CommandPostcondition.ResultDataResolvable<T, D>>;

    public static from<D = any>(data: PostconditionModule.Resolvable<D>): PostconditionModule<D> {
        if (hasMixin(data, PostconditionModule)) return data;

        const ModuleInstance = class extends PostconditionModule { execute = data.execute; };
        Object.assign(ModuleInstance.prototype, data);
        return new ModuleInstance();
    }
}

export namespace PostconditionModule {
    export type Resolvable<D = any> = PostconditionModule<D>|PostconditionModule.Data<D>;

    export interface Data<D = any> extends Omit<BaseModule.Data, 'moduleType'>, Omit<CommandPostcondition.Data<D>, 'id'> {
        moduleType: ModuleType.Postcondition;
    }
}
