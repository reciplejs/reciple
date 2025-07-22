import { SeparatorBuilder, type SeparatorComponentData } from 'discord.js';

export function Separator(props: Separator.Props): SeparatorBuilder {
    const builder = new SeparatorBuilder();

    if (props.id !== undefined) builder.setId(props.id);
    if (props.divider !== undefined) builder.setDivider(props.divider);
    if (props.spacing !== undefined) builder.setSpacing(props.spacing);

    return builder;
}

export namespace Separator {
    export interface Props extends Omit<SeparatorComponentData, 'type'> {}
}
