import { MessageCommand, MessageCommandBuilder, MessageCommandModule } from "reciple";
import { Poll, PollAnswer, PollAnswers, PollQuestionMedia } from '@reciple/jsx/poll';

export class MessagePollCommand extends MessageCommandModule {
    data = new MessageCommandBuilder()
        .setName('poll')
        .setDescription('Creates a testing poll')
        .addOption(name => name
            .setName('name')
            .setDescription('The name of the poll')
            .setRequired(true)
        )
        .setAliases('p')
        .toJSON();

    async execute(data: MessageCommand.ExecuteData) {
        const name = data.options.getOptionValue('name', true);

        await data.message.reply({
            poll: (
                <Poll duration={24} allowMultiselect={false}>
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
