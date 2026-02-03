import { phoneNumber } from 'discord.js';

export function PhoneNumber({ number }: PhoneNumber.Props): string {
    return phoneNumber(number);
}

export namespace PhoneNumber {
    export interface Props {
        number: `+${string}`;
    }
}
