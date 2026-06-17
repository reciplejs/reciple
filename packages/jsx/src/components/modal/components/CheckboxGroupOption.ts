import { CheckboxGroupOptionBuilder, type APICheckboxGroupOption } from 'discord.js';

export function CheckboxGroupOption(props: CheckboxGroupOption.Props): CheckboxGroupOptionBuilder {
    return new CheckboxGroupOptionBuilder(props);
}

export namespace CheckboxGroupOption {
    export interface Props extends APICheckboxGroupOption {}
}
