import { SlashCommandBuilder, SlashCommandModule, type SlashCommand } from "reciple";
import { Checkbox, CheckboxGroup, CheckboxGroupOption, File, FileUpload, Label, Modal, RadioGroup, RadioGroupOption, Separator, TextDisplay, TextInput } from '@reciple/jsx';
import { AttachmentBuilder, TextInputStyle } from 'discord.js';
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
                const myInput = interaction.fields.getTextInputValue('my-input');
                const myParagraph = interaction.fields.getTextInputValue('my-paragraph');
                const files = Array.from(interaction.fields.getUploadedFiles('my-file-upload')?.values() ?? []);

                await interaction.deferReply({
                    flags: ['Ephemeral']
                });

                await interaction.editReply({
                    flags: ['IsComponentsV2'],
                    components: <>
                        <TextDisplay># {myInput}</TextDisplay>
                        <TextDisplay>{myParagraph}</TextDisplay>
                        <Separator/>
                        {files.map((file) => <File url={`attachment://${file.name}`}/>)}
                    </>,
                    files: files.map((file) => new AttachmentBuilder(file.url, { name: file.name }))
                });
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
                    <CheckboxGroup customId='checkbox-group'>
                        <CheckboxGroupOption label='Option 1' value='option1'/>
                        <CheckboxGroupOption label='Option 2' value='option2'/>
                        <CheckboxGroupOption label='Option 3' value='option3'/>
                    </CheckboxGroup>
                </Label>
                <Label label='Radio Group' description='This is an example radio group'>
                    <RadioGroup customId='radio-group'>
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
