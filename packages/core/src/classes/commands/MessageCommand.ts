import type { Message } from 'discord.js';
import { CommandType } from '../../helpers/constants.js';
import { BaseCommand } from '../abstract/BaseCommand.js';

export class MessageCommand extends BaseCommand<CommandType.Message> {
    public readonly type: CommandType.Message = CommandType.Message;

    public constructor(data?: Partial<MessageCommand.Data>) {
        super(data);
    }

    public toJSON(): MessageCommand.Data {
        return super.toJSON();
    }
}

export namespace MessageCommand {
    export interface Data extends BaseCommand.Data<CommandType.Message> {}

    export interface ExecuteData extends BaseCommand.ExecuteData<CommandType.Message> {
        message: Message;
    }

    export interface ExecuteOptions extends BaseCommand.ExecuteOptions<CommandType.Message> {
        message: Message;
    }
}
