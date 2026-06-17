import { CheckboxGroupBuilder, isJSONEncodable, type APICheckboxGroupOption, type CheckboxGroupComponentData, type JSONEncodable } from 'discord.js';
import { JSX } from '../../../jsx-runtime.js';

export function CheckboxGroup(props: CheckboxGroup.Props): CheckboxGroupBuilder {
    const builder = new CheckboxGroupBuilder(props);
    const children = JSX.useSingleToArray(props.children).filter(c => c !== undefined) as (JSONEncodable<APICheckboxGroupOption>|APICheckboxGroupOption)[];

    builder.addOptions(children.map(c => isJSONEncodable(c) ? c.toJSON() : c));

    return builder;
}

export namespace CheckboxGroup {
    export interface Props extends Omit<CheckboxGroupComponentData, 'options'> {
        children?: JSX.SingleOrArray<JSONEncodable<APICheckboxGroupOption>|APICheckboxGroupOption>;
    }
}
