import { CheckboxBuilder, type CheckboxComponentData } from 'discord.js';

export function Checkbox(props: Checkbox.Props): CheckboxBuilder {
    const builder = new CheckboxBuilder(props);

    if (props.id !== undefined) builder.setId(props.id);
    if (props.customId !== undefined) builder.setCustomId(props.customId);

    return builder;
}

export namespace Checkbox {
    export interface Props extends Omit<CheckboxComponentData, 'type'> {}
}
