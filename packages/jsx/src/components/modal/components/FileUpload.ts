import { FileUploadBuilder } from 'discord.js';

export function FileUpload(props: FileUpload.Props): FileUploadBuilder  {
    const builder = new FileUploadBuilder(props);

    if (props.id !== undefined) builder.setId(props.id);
    if (props.customId !== undefined) builder.setCustomId(props.customId);
    if (props.minValues !== undefined) builder.setMinValues(props.minValues);
    if (props.maxValues !== undefined) builder.setMaxValues(props.maxValues);
    if (props.required !== undefined) builder.setRequired(props.required);

    return builder;
}

export namespace FileUpload {
    export interface Props {
        id?: number;
        customId: string;
        minValues?: number;
        maxValues?: number;
        required?: boolean;
    }
}

