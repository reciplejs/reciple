import type { EmbedAssetData, EmbedData } from 'discord.js';

export function EmbedThumbnail(props: EmbedThumbnail.Props): EmbedData {
    return {
        thumbnail: {
            url: props.url
        }
    };
}

export namespace EmbedThumbnail {
    export interface Props extends Pick<EmbedAssetData, 'url'> {}
}
