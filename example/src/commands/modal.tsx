import { SlashCommandBuilder, SlashCommandModule, type SlashCommand } from "reciple";
import { File, FileUpload, Label, Modal, Separator, TextDisplay, TextInput } from '@reciple/jsx';
import { AttachmentBuilder, TextInputStyle } from 'discord.js';

export class MessagePollCommand extends SlashCommandModule {
    data = new SlashCommandBuilder()
        .setName('modal')
        .setDescription('Test modal command')
        .toJSON();

    async execute(data: SlashCommand.ExecuteData) {
        await data.interaction.showModal(
            <Modal customId='my-modal' title='This is a modal rawr'>
                <Label label='My Input' description='This is an example input'>
                    <TextInput customId='my-input' style={TextInputStyle.Short}/>
                </Label>
                <Label label='My Paragraph' description='This is an example paragraph input'>
                    <TextInput customId='my-paragraph' style={TextInputStyle.Paragraph}/>
                </Label>
                <Label label='My File' description='This is an example file upload'>
                    <FileUpload customId='my-file-upload' maxValues={3} required={false}/>
                </Label>
            </Modal>
        );

        const response = await data.interaction.awaitModalSubmit({ time: 60000 });
        const myInput = response.fields.getTextInputValue('my-input');
        const myParagraph = response.fields.getTextInputValue('my-paragraph');
        const files = Array.from(response.fields.getUploadedFiles('my-file-upload')?.values() ?? []);

        await response.deferReply({
            flags: ['Ephemeral']
        });

        await response.editReply({
            flags: ['IsComponentsV2'],
            components: <>
                <TextDisplay># {myInput}</TextDisplay>
                <TextDisplay>{myParagraph}</TextDisplay>
                <Separator/>
                {files.map((file) => <File url={`attachment://${file.name}`}/>)}
            </>,
            files: files.map((file) => new AttachmentBuilder(file.url, {
                name: file.name
            })),
        });
    }
}

export default new MessagePollCommand();
