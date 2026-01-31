import { Section, TextDisplay, Thumbnail } from '@reciple/jsx';
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
                <TextDisplay># V2 Components</TextDisplay>
                <Section>
                    <Thumbnail url='https://avatars.githubusercontent.com/u/69035887?v=4'/>
                    <TextDisplay>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Provident repellat fuga officiis minus enim, consequatur blanditiis suscipit, itaque ducimus voluptatibus tempora est recusandae eos reprehenderit ipsa rerum, laudantium nam voluptatem.</TextDisplay>
                </Section>
            </>
        })
    }
}

export default new V2();
