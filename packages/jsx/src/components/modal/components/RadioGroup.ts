import { isJSONEncodable, RadioGroupBuilder, type APIRadioGroupOption, type JSONEncodable, type RadioGroupComponentData } from 'discord.js';
import { JSX } from '../../../jsx-runtime.js';

export function RadioGroup(props: RadioGroup.Props): RadioGroupBuilder {
    const builder = new RadioGroupBuilder(props);
    const children = JSX.useSingleToArray(props.children).filter(c => c !== undefined) as (JSONEncodable<APIRadioGroupOption>|APIRadioGroupOption)[];

    builder.addOptions(children.map(c => isJSONEncodable(c) ? c.toJSON() : c));

    return builder;
}

export namespace RadioGroup {
    export interface Props extends Omit<RadioGroupComponentData, 'options'> {
        children?: JSX.SingleOrArray<JSONEncodable<APIRadioGroupOption>|APIRadioGroupOption>;
    }
}
