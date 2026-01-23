export namespace Format {
    export function bytes(bytes: number, decimals = 2): string {
        if (bytes === 0) return '0 B';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    export function duration(duration: number): string {
        const milliseconds = duration % 1000;
        const seconds = Math.floor(duration / 1000) % 60;
        const minutes = Math.floor(duration / 60000) % 60;
        const hours = Math.floor(duration / 3600000) % 24;
        const days = Math.floor(duration / 86400000);

        const parts = []

        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (seconds > 0) parts.push(`${seconds}s`);
        if (milliseconds > 0) parts.push(`${milliseconds}ms`);

        return parts.join(' ') || '0ms';
    }


    export function plural(count: number, singular: string, plural?: string): string
    export function plural(isPlural: boolean, singular: string, plural?: string): string
    export function plural(countOrCondition: number|boolean, singular: string, plural?: string): string
    export function plural(countOrCondition: number|boolean, singular: string, plural?: string): string {
        const isPlural = typeof countOrCondition === 'boolean' ? countOrCondition : countOrCondition > 1;

        return isPlural ? plural ?? `${singular}s` : singular;
    }
}
