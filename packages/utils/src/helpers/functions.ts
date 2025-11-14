import inspector from 'node:inspector';
import type { DateResolvable, RecursiveDefault } from './types.js';

export function isDebugging(): boolean {
    return !!inspector.url() || /--debug|--inspect/g.test(process.execArgv.join(''));
}

export function recursiveDefaults<T = unknown>(data: RecursiveDefault<T>|T): T|undefined {
    function isDefaults(object: any): object is RecursiveDefault<T> {
        return object?.default !== undefined;
    }

    if (!isDefaults(data)) return data;

    return recursiveDefaults(data.default!);
}

export function escapeRegexp(str: string): string {
    return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d');
}

export function formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function sortRecordByKey<T extends Record<any, any>>(record: T, sort?: (a: keyof T, b: keyof T) => number): T {
    return Object.keys(record)
        .sort(sort)
        .reduce((obj, key: keyof T) => {
            obj[key] = record[key];
            return obj;
        }, {} as T);
}

export function resolveDate(resolvable: DateResolvable): Date {
    if (resolvable instanceof Date) return resolvable;
    if (typeof resolvable === 'string' || typeof resolvable === 'number') return new Date(resolvable);

    throw new TypeError(`Expected a Date, number, or string, but received ${typeof resolvable}`);
}

export function resolveEnvProtocol(string: string, env: NodeJS.ProcessEnv = process.env): string|undefined {
    if (!string.toLocaleLowerCase().startsWith('env:')) return;
    return env?.[string.slice(4)];
}

export function isDateResolvable(value: unknown): value is DateResolvable {
    return value instanceof Date || typeof value === 'number' || typeof value === 'string';
}
