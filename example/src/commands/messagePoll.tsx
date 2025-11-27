import { MessageCommandBuilder, MessageCommandModule, type MessageCommand } from "reciple";
import { Poll, PollAnswer, PollAnswers, PollQuestionMedia } from '@reciple/jsx/poll';
import '@/commands/modal';

export class MessagePollCommand extends MessageCommandModule {
    data = new MessageCommandBuilder()
        .setName('poll')
        .setDescription('Creates a testing poll')
        .addOption(name => name
            .setName('name')
            .setDescription('The name of the poll')
            .setRequired(true)
        )
        .addFlag(option => option
            .setName('duration')
            .setShortcut('d')
            .setDescription('The hours duration of the poll')
            .setResolve(d => d.values?.map(d => Number(d)) ?? [24])
            .setRequired(false)
        )
        .addFlag(option => option
            .setName('allow-multiple-select')
            .setShortcut('m')
            .setValueType('boolean')
            .setDescription('Allow multiple answers')
        )
        .setAliases('p')
        .toJSON();

    async execute(data: MessageCommand.ExecuteData) {
        const name = data.options.getOptionValue('name', true);
        const duration = await data.flags.getFlagResolvedValues<number>('duration', false);
        const allowMultipleSelect = data.flags.getFlagValues('allow-multiple-select', { required: false, type: 'boolean' });

        await data.message.reply({
            poll: (
                <Poll duration={duration?.at(0)} allowMultiselect={allowMultipleSelect?.at(0)}>
                    <PollQuestionMedia>{name}</PollQuestionMedia>
                    <PollAnswers>
                        <PollAnswer emoji={'✅'}>Yes</PollAnswer>
                        <PollAnswer emoji={'❌'}>No</PollAnswer>
                    </PollAnswers>
                </Poll>
            )
        });
    }
}

export default new MessagePollCommand();
