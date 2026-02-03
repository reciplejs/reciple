import { phoneNumber } from 'discord.js';
import { JSX } from '../../../jsx-runtime.js';

export function PhoneNumber({ children }: PhoneNumber.Props): string {
    return phoneNumber(JSX.useStringify(children) as `+${string}`);
}

export namespace PhoneNumber {
    export interface Props {
        children: JSX.SingleOrArray<string>;
    }
}
