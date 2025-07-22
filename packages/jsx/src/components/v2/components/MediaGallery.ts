import { MediaGalleryBuilder, type APIMediaGalleryItem, type MediaGalleryComponentData, type MediaGalleryItemBuilder } from 'discord.js';
import { JSX } from '../../../structures/JSX.js';

export function MediaGallery(props: MediaGallery.Props): MediaGalleryBuilder {
    const builder = new MediaGalleryBuilder();

    if (props.id !== undefined) builder.setId(props.id);

    builder.addItems(JSX.useSingleToArray(props.children).filter(d => !!d));

    return builder;
}

export namespace MediaGallery {
    export interface Props extends Omit<MediaGalleryComponentData, 'type'|'children'> {
        children?: JSX.SingleOrArray<APIMediaGalleryItem|MediaGalleryItemBuilder>;
    }
}
