import { LabelBuilder, type APIComponentInLabel, type APILabelComponent } from 'discord.js';
import { JSX } from '../../../jsx-runtime.js';

export function Label(props: Label.Props): LabelBuilder {
    const builder = new LabelBuilder({
        component: JSX.useSingleToArray(props.children)[0]
    });

    if (props.id !== undefined) builder.setId(props.id);
    if (props.label !== undefined) builder.setLabel(props.label);
    if (props.description !== undefined) builder.setDescription(props.description);

    return builder;
}

export namespace Label {
    export interface Props extends Omit<APILabelComponent, 'type'|'component'> {
        children?: JSX.SingleOrArray<APIComponentInLabel>;
    }
}
