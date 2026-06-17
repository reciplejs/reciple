import { SlashCommandBuilder, SlashCommandModule, type SlashCommand } from "reciple";
import { Bold, Checkbox, CheckboxGroup, CheckboxGroupOption, File, FileUpload, Label, LineBreak, Modal, RadioGroup, RadioGroupOption, Separator, TextDisplay, TextInput } from '@reciple/jsx';
import { AttachmentBuilder, TextInputStyle, type InteractionEditReplyOptions } from 'discord.js';
import { InteractionListenerBuilder, InteractionListenerType } from '@reciple/modules';

export class MessagePollCommand extends SlashCommandModule {
    data = new SlashCommandBuilder()
        .setName('modal')
        .setDescription('Test modal command')
        .toJSON();

    interactions = [
        new InteractionListenerBuilder()
            .setType(InteractionListenerType.ModalSubmit)
            .setFilter(interaction => interaction.customId === 'my-modal')
            .setExecute(async interaction => {
                const myParagraph = interaction.fields.getTextInputValue('my-paragraph');
                const myFiles = Array.from(interaction.fields.getUploadedFiles('my-file-upload')?.values() ?? []);
                const myCheckboxGroup = interaction.fields.getCheckboxGroup('my-checkbox-group');
                const myRadioGroup = interaction.fields.getRadioGroup('my-radio-group');
                const myCheckbox = interaction.fields.getCheckbox('my-checkbox');

                await interaction.deferReply({
                    flags: ['Ephemeral']
                });

                const data: InteractionEditReplyOptions = {
                    flags: ['IsComponentsV2'],
                    components: <>
                        <TextDisplay>
                            <Bold>{myParagraph}</Bold>
                            <LineBreak/>
                            Checkbox Group: {myCheckboxGroup?.join(', ')}
                            <LineBreak/>
                            Radio Group: {myRadioGroup}
                            <LineBreak/>
                            Checkbox: {myCheckbox ? 'Checked' : 'Unchecked'}
                        </TextDisplay>
                        <Separator/>
                        {myFiles.map((file) => <File url={`attachment://${file.name}`}/>)}
                    </>,
                    files: myFiles.map((file) => new AttachmentBuilder(file.url, { name: file.name }))
                };

                useLogger().info('Received modal submit with data:', data);

                await interaction.editReply(data);
            })
    ];

    async execute(data: SlashCommand.ExecuteData) {
        await data.interaction.showModal(
            <Modal customId='my-modal' title='This is a modal rawr'>
                <Label label='My Paragraph' description='This is an example paragraph input'>
                    <TextInput customId='my-paragraph' style={TextInputStyle.Paragraph}/>
                </Label>
                <Label label='My File' description='This is an example file upload'>
                    <FileUpload customId='my-file-upload' maxValues={3} required={false}/>
                </Label>
                <Label label='Checkbox Group' description='This is an example checkbox group'>
                    <CheckboxGroup customId='my-checkbox-group'>
                        <CheckboxGroupOption label='Option 1' value='option1'/>
                        <CheckboxGroupOption label='Option 2' value='option2'/>
                        <CheckboxGroupOption label='Option 3' value='option3'/>
                    </CheckboxGroup>
                </Label>
                <Label label='Radio Group' description='This is an example radio group'>
                    <RadioGroup customId='my-radio-group'>
                        <RadioGroupOption label='Option 1' value='option1'/>
                        <RadioGroupOption label='Option 2' value='option2'/>
                        <RadioGroupOption label='Option 3' value='option3'/>
                    </RadioGroup>
                </Label>
                <Label label='Checkbox' description='This is an example checkbox'>
                    <Checkbox customId='my-checkbox'/>
                </Label>
            </Modal>
        );
    }
}

export default new MessagePollCommand();
