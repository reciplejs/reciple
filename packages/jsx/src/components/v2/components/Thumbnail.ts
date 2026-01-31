import { ThumbnailBuilder, type ThumbnailComponentData } from 'discord.js';

export function Thumbnail(props: Thumbnail.Props): ThumbnailBuilder {
    const builder = new ThumbnailBuilder();

    if (props.id !== undefined) builder.setId(props.id);
    if (props.description !== undefined) builder.setDescription(props.description);
    if (props.spoiler !== undefined) builder.setSpoiler(props.spoiler);
    if (props.url !== undefined) builder.setURL(props.url);

    return builder;
}

export namespace Thumbnail {
    export interface Props extends Omit<ThumbnailComponentData, 'type'|'media'> {
        url: string;
    }
}
