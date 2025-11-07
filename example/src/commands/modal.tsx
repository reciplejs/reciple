import { SlashCommandBuilder, SlashCommandModule, type SlashCommand } from "reciple";
import { Container, File, FileUpload, Label, Modal, Separator, TextDisplay, TextInput } from '@reciple/jsx';
import { Colors, TextInputStyle } from 'discord.js';

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
                    <FileUpload customId='my-file-upload'/>
                </Label>
            </Modal>
        );

        const response = await data.interaction.awaitModalSubmit({ time: 60000 });
        const myInput = response.fields.getTextInputValue('my-input');
        const myParagraph = response.fields.getTextInputValue('my-paragraph');
        const files = response.fields.getUploadedFiles('my-file-upload');

        await response.reply({
            flags: ['IsComponentsV2'],
            components: [
                <Container accentColor={Colors.Aqua}>
                    <TextDisplay># {myInput}</TextDisplay>
                    <TextDisplay>{myParagraph}</TextDisplay>
                    <Separator/>
                    {files?.map(file => (
                        <File url={file.url}/>
                    )) ?? <TextDisplay>No files uploaded.</TextDisplay>}
                </Container>
            ]
        });
    }
}

export default new MessagePollCommand();
