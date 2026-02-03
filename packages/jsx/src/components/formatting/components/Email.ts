import { email } from 'discord.js';
import { JSX } from '../../../jsx-runtime.js';

export function Email({ children }: Email.Props): string {
    return email(JSX.useStringify(children));
}

export namespace Email {
    export interface Props {
        children?: JSX.SingleOrArray<any>;
    }
}
