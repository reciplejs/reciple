import { MediaGalleryItemBuilder, type MediaGalleryItemData } from 'discord.js';

export function MediaGalleryItem(props: MediaGalleryItem.Props): MediaGalleryItemBuilder {
    const builder = new MediaGalleryItemBuilder();

    if (props.spoiler !== undefined) builder.setSpoiler(props.spoiler);
    if (props.description !== undefined) builder.setDescription(props.description);

    builder.setURL(props.url);

    return builder;
}

export namespace MediaGalleryItem {
    export interface Props extends Omit<MediaGalleryItemData, 'media'> {
        url: string;
    };
}
