import { time, type TimestampStylesString } from 'discord.js';

export function Time({ date, seconds, style }: Time.Props): string {
    if (date) return time(date, style as 'R');
    if (seconds) return time(seconds, style as 'R');

    throw new Error('No date or seconds provided');
}

export namespace Time {
    export interface Props {
        date?: Date;
        seconds?: number;
        style?: TimestampStylesString;
    }
}
