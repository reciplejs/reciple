import { type APIFileComponent, ComponentType, ContainerBuilder, FileBuilder, isJSONEncodable, type ActionRowBuilder, type APIActionRowComponent, type APIComponentInMessageActionRow, type APIMediaGalleryComponent, type APISectionComponent, type APISeparatorComponent, type APITextDisplayComponent, type ContainerComponentData, type MediaGalleryBuilder, type MessageActionRowComponentBuilder, type RGBTuple, type SectionBuilder, type SeparatorBuilder, type TextDisplayBuilder } from 'discord.js';
import { JSX } from '../../../structures/JSX.js';

export function Container(props: Container.Props): ContainerBuilder {
    const builder = new ContainerBuilder();

    if (props.id !== undefined) builder.setId(props.id);
    if (props.spoiler !== undefined) builder.setSpoiler(props.spoiler);

    builder.setAccentColor(props.accentColor);

    if (props.children !== undefined) {
        const children = JSX.useSingleToArray(props.children).map(c => isJSONEncodable(c) ? c.toJSON() : c);

        for (const child of children) {
            switch (child.type) {
                case ComponentType.ActionRow:
                    builder.addActionRowComponents(child);
                    break;
                case ComponentType.File:
                    builder.addFileComponents(child);
                    break;
                case ComponentType.Section:
                    builder.addSectionComponents(child);
                    break;
                case ComponentType.TextDisplay:
                    builder.addTextDisplayComponents(child);
                    break;
                case ComponentType.MediaGallery:
                    builder.addMediaGalleryComponents(child);
                    break;
                case ComponentType.Separator:
                    builder.addSeparatorComponents(child);
                    break;
            }
        }
    }

    return builder;
}

export namespace Container {
    export interface Props extends Omit<ContainerComponentData, 'type'|'accentColor'|'components'> {
        accentColor?: RGBTuple|number;
        children?: JSX.SingleOrArray<ComponentBuilder|APIComponent>;
    }

    export type ComponentBuilder = ActionRowBuilder<MessageActionRowComponentBuilder>
        | FileBuilder
        | MediaGalleryBuilder
        | SectionBuilder
        | SeparatorBuilder
        | TextDisplayBuilder;

    export type APIComponent = APIActionRowComponent<APIComponentInMessageActionRow>
        | APIFileComponent
        | APIMediaGalleryComponent
        | APISectionComponent
        | APISeparatorComponent
        | APITextDisplayComponent;
}
