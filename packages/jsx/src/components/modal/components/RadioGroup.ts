import { isJSONEncodable, RadioGroupBuilder, type APIRadioGroupOption, type JSONEncodable, type RadioGroupComponentData } from 'discord.js';
import { JSX } from '../../../jsx-runtime.js';

export function RadioGroup(props: RadioGroup.Props): RadioGroupBuilder {
    const builder = new RadioGroupBuilder(props);
    const children = JSX.useSingleToArray(props.children).filter(c => c !== undefined) as (JSONEncodable<APIRadioGroupOption>|APIRadioGroupOption)[];

    builder.addOptions(children.map(c => isJSONEncodable(c) ? c.toJSON() : c));

    if (props.id !== undefined) builder.setId(props.id);
    if (props.customId !== undefined) builder.setCustomId(props.customId);

    return builder;
}

export namespace RadioGroup {
    export interface Props extends Omit<RadioGroupComponentData, 'options'|'type'> {
        children?: JSX.SingleOrArray<JSONEncodable<APIRadioGroupOption>|APIRadioGroupOption>;
    }
}
