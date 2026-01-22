import inspector from 'node:inspector';
import type { DateResolvable, RecursiveDefault } from './types.js';

/**
 * Checks if the process is being debugged
 * @returns Whether the process is being debugged
 */
export function isDebugging(): boolean {
    return !!inspector.url() || /--debug|--inspect/g.test(process.execArgv.join(''));
}

/**
 * Recursively gets the default value of an object
 * @param data The object to get the default value
 * @returns The default value
 */
export function recursiveDefaults<T = unknown>(data: RecursiveDefault<T>|T): T|undefined {
    function isDefaults(object: any): object is RecursiveDefault<T> {
        return object?.default !== undefined;
    }

    if (!isDefaults(data)) return data;

    return recursiveDefaults(data.default!);
}

/**
 * Escapes a string for use in a regular expression
 * @param str The string to escape
 * @returns The escaped string
 */
export function escapeRegexp(str: string): string {
    return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d');
}

/**
 * Sorts a record by key using the given sort function
 * @param record The record to sort
 * @param sort The sort function
 * @returns The sorted record
 */
export function sortRecordByKey<T extends Record<any, any>>(record: T, sort?: (a: keyof T, b: keyof T) => number): T {
    return Object.keys(record)
        .sort(sort)
        .reduce((obj, key: keyof T) => {
            obj[key] = record[key];
            return obj;
        }, {} as T);
}

/**
 * Resolves a date from a Date, number, or string
 * @param resolvable The date to resolve
 * @returns The resolved date
 */
export function resolveDate(resolvable: DateResolvable): Date {
    if (resolvable instanceof Date) return resolvable;
    if (typeof resolvable === 'string' || typeof resolvable === 'number') return new Date(resolvable);

    throw new TypeError(`Expected a Date, number, or string, but received ${typeof resolvable}`);
}

/**
 * Checks if a value is a Date, number, or string
 * @param value The value to check
 * @returns Whether the value is a Date, number, or string
 */
export function isDateResolvable(value: unknown): value is DateResolvable {
    return value instanceof Date || typeof value === 'number' || typeof value === 'string';
}

/**
 * Resolves an environment variable from a string
 * @param string A string that starts with "env:"
 * @param env The current environment variables
 * @returns The resolved environment variable
 */
export function resolveEnvProtocol(string: string, env: NodeJS.ProcessEnv = process.env): string|undefined {
    if (!string.toLocaleLowerCase().startsWith('env:')) return;
    return env?.[string.slice(4)];
}
