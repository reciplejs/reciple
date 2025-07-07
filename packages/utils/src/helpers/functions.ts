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

export function resolveDate(resolvable: DateResolvable): Date {
    if (resolvable instanceof Date) return resolvable;
    if (typeof resolvable === 'string' || typeof resolvable === 'number') return new Date(resolvable);

    throw new TypeError(`Expected a Date, number, or string, but received ${typeof resolvable}`);
}

export function isDateResolvable(value: unknown): value is DateResolvable {
    return value instanceof Date || typeof value === 'number' || typeof value === 'string';
}
