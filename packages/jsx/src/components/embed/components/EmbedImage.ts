import type { EmbedAssetData, EmbedData } from 'discord.js';

export function EmbedImage(props: EmbedImage.Props): EmbedData {
    return {
        image: {
            url: props.url
        }
    };
}

export namespace EmbedImage {
    export interface Props extends Pick<EmbedAssetData, 'url'> {}
}
