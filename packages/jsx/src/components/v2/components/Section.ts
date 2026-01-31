import { ButtonBuilder, ComponentType, SectionBuilder, TextDisplayBuilder, ThumbnailBuilder, type APIButtonComponent, type APITextDisplayComponent, type APIThumbnailComponent, type SectionComponentData } from 'discord.js';
import { JSX } from '../../../structures/JSX.js';

export function Section(props: Section.Props): SectionBuilder {
    const builder = new SectionBuilder();

    if (props.id !== undefined) builder.setId(props.id);

    const children = JSX.useSingleToArray(props.children)
        .filter(d => !!d)
        .flat();

    for (const child of children) {
        if ('type' in child) switch (child.type) {
            case ComponentType.TextDisplay:
                builder.addTextDisplayComponents(new TextDisplayBuilder(child));
                break;
            case ComponentType.Button:
                builder.setButtonAccessory(child);
                break;
            case ComponentType.Thumbnail:
                builder.setThumbnailAccessory(child);
                break;
        }

        if (child instanceof TextDisplayBuilder) builder.addTextDisplayComponents(child);
        if (child instanceof ButtonBuilder) builder.setButtonAccessory(child);
        if (child instanceof ThumbnailBuilder) builder.setThumbnailAccessory(child);
    }

    return builder;
}

export namespace Section {
    export interface Props extends Omit<SectionComponentData, 'type'|'components'|'accessory'> {
        children?: JSX.SingleOrArray<JSX.SingleOrArray<ComponentBuilder|APIComponent>|AccessoryBuilder|APIAccessory>;
    }

    export type AccessoryBuilder =
        | ButtonBuilder
        | ThumbnailBuilder;

    export type APIAccessory =
        | APIButtonComponent
        | APIThumbnailComponent;

    export type ComponentBuilder =
        | TextDisplayBuilder;

    export type APIComponent =
        | APITextDisplayComponent;
}
