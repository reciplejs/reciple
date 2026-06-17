import { type APIRadioGroupOption, RadioGroupOptionBuilder } from 'discord.js';

export function RadioGroupOption(props: RadioGroupOption.Props): RadioGroupOptionBuilder {
    return new RadioGroupOptionBuilder(props);
}

export namespace RadioGroupOption {
    export interface Props extends APIRadioGroupOption {}
}
