
export namespace JSX {
    export type SingleOrArray<T> = T|T[];

    export function useFragment<T = unknown>(props: { children: any[] }): T[] {
        return Array.isArray(props.children) ? props.children.flat() : [props.children];
    }

    export function useElement(element: Function, props: Record<string, unknown>, ...children: unknown[]): any {
        return element({ children, ...props });
    }

    export function useStringify(value: any|any[], fallback?: string): string {
        return (Array.isArray(value) ? value.join('') : String(value ?? '')) || String(fallback ?? '');
    }

    export function useSingleToArray<T = any>(value: T|T[]): T[] {
        return (Array.isArray(value) ? value.flat() : [value]).filter(t => typeof t !== 'undefined') as T[];
    }
}
