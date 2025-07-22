import type { APIEmbedField } from 'discord.js';
import type { SingleOrArray } from '../../../helpers/types.js';

export function EmbedField(props: EmbedField.Props): APIEmbedField {
    return {
        name: props.name,
        value: props.value ?? Array.isArray(props.children)
            ? props.children.join(' ')
            : String(props.children),
        inline: props.inline
    }

}

export namespace EmbedField {
    export interface Props extends Omit<APIEmbedField, 'value'> {
        value?: string;
        children?: SingleOrArray<any>;
    }
}
