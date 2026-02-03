import { Bold, Email, Heading, Hyperlink, InlineCode, Italic, LineBreak, List, ListItem, Mention, PhoneNumber, Section, Separator, Spoiler, Strike, SubList, SubText, TextDisplay, Thumbnail, Time, Underline } from '@reciple/jsx';
import { SlashCommandBuilder, SlashCommandModule, type SlashCommand } from 'reciple';

export class V2 extends SlashCommandModule {
    public data = new SlashCommandBuilder()
        .setName('v2')
        .setDescription('A v2 components preview')
        .toJSON();

    public async execute(data: SlashCommand.ExecuteData): Promise<void> {
        await data.interaction.reply({
            flags: ['IsComponentsV2'],
            components: <>
                <TextDisplay>
                    <Heading>This is an example</Heading>
                </TextDisplay>
                <Section>
                    <Thumbnail url='https://avatars.githubusercontent.com/u/69035887?v=4'/>
                    <TextDisplay>
                        <Heading level={3}>Heading</Heading>
                        <LineBreak/>
                        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Provident repellat fuga officiis minus enim, consequatur blanditiis suscipit, itaque ducimus voluptatibus tempora est recusandae eos reprehenderit ipsa rerum, laudantium nam voluptatem.
                        <LineBreak/>
                        <SubText>By <Mention id={data.interaction.user.id} type='user'/></SubText>
                    </TextDisplay>
                </Section>
                <Separator/>
                <TextDisplay>
                    <List type='ordered'>
                        <ListItem>
                            <Bold>Item 1</Bold>
                        </ListItem>
                        <ListItem>
                            <Italic>Item 2</Italic>
                        </ListItem>
                        <ListItem>
                            <Underline>Item 3</Underline>
                        </ListItem>
                        <SubList>
                            <ListItem>
                                <Strike>Subitem 1</Strike>
                            </ListItem>
                            <ListItem>
                                <InlineCode>Subitem 2</InlineCode>
                            </ListItem>
                            <ListItem>
                                <Spoiler>Subitem 3</Spoiler>
                            </ListItem>
                        </SubList>
                    </List>
                </TextDisplay>
                <Separator/>
                <TextDisplay>
                    <List>
                        <ListItem>
                            <Email>7H0eT@example.com</Email>
                        </ListItem>
                        <ListItem>
                            <PhoneNumber>+1234567890</PhoneNumber>
                        </ListItem>
                        <ListItem>
                            <Hyperlink url='https://example.com'>Example</Hyperlink>
                        </ListItem>
                    </List>
                    <LineBreak/>
                    <SubText>Sent <Time date={data.interaction.createdAt} style='R'/></SubText>
                </TextDisplay>
            </>
        })
    }
}

export default new V2();
