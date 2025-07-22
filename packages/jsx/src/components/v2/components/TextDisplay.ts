import { TextDisplayBuilder, type TextDisplayComponentData } from 'discord.js';
import { JSX } from '../../../structures/JSX.js';

export function TextDisplay(props: TextDisplay.Props): TextDisplayBuilder {
    const builder = new TextDisplayBuilder(props);

    builder.setContent(JSX.useStringify(props.children, props.content));

    return builder;
}

export namespace TextDisplay {
    export interface Props extends Omit<TextDisplayComponentData, 'type'|'content'> {
        content?: string;
        children?: JSX.SingleOrArray<any>;
    }
}
