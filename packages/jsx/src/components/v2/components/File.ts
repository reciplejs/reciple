import { FileBuilder, type FileComponentData } from 'discord.js';

export function File(props: File.Props): FileBuilder {
    const builder = new FileBuilder();

    builder.setURL(props.url);

    if (props.id !== undefined) builder.setId(props.id);
    if (props.spoiler !== undefined) builder.setSpoiler(props.spoiler);

    return builder;
}

export namespace File {
    export interface Props extends Omit<FileComponentData, 'type'|'file'> {
        url: string;
    }
}
