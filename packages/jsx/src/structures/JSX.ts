
export namespace JSX {
    export type Element = any;

    export function useFragment<T = unknown>(props: { children: T[] }): T[] {
        return Array.isArray(props.children) ? props.children.flat() as T[] : [props.children];
    }

    export function useElement<T = unknown>(element: (props: Record<string, unknown>) => T, props: Record<string, unknown>, ...children: unknown[]): T {
        return element({ children, ...props });
    }
}
