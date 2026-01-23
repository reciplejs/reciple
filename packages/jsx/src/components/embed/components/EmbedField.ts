import type { APIEmbedField } from 'discord.js';
import { JSX } from '../../../structures/JSX.js';

export function EmbedField(props: EmbedField.Props): APIEmbedField {
    return {
        name: props.name,
        value: JSX.useStringify(props.children, props.value),
        inline: props.inline
    }

}

export namespace EmbedField {
    export interface Props extends Omit<APIEmbedField, 'value'> {
        value?: string;
        children?: JSX.SingleOrArray<any>;
    }
}
