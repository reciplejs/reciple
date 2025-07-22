import { EmbedBuilder, type APIEmbed, type ColorResolvable } from 'discord.js';
import { JSX } from '../../../structures/JSX.js';

export function Embed(props: Embed.Props) {
    const builder = new EmbedBuilder();

    if (props.color !== undefined) builder.setColor(props.color);
    if (props.url !== undefined) builder.setURL(props.url);
    if (props.title !== undefined) builder.setTitle(props.title);
    if (props.timestamp !== undefined) builder.setTimestamp(
        props.timestamp instanceof Date || props.timestamp === null
            ? props.timestamp
            : new Date(props.timestamp)
    );

    for (const child of JSX.useSingleToArray(props.children)) {
        if (child?.author !== undefined) builder.setAuthor(child.author);
        if (child?.description !== undefined) builder.setDescription(child.description);
        if (child?.fields !== undefined) builder.addFields(...child.fields);
        if (child?.footer !== undefined) builder.setFooter(child.footer);
        if (child?.image !== undefined) builder.setImage(child.image.url);
        if (child?.thumbnail !== undefined) builder.setThumbnail(child.thumbnail.url);
        if (child?.title !== undefined) builder.setTitle(child.title);
    }

    return builder;
}

export namespace Embed {
    export interface Props extends Pick<APIEmbed, 'url'|'title'> {
        children?: JSX.SingleOrArray<APIEmbed>;
        color?: ColorResolvable;
        timestamp?: Date|number|string|null;
    }
}
