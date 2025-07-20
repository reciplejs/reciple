export class JSX {}

export namespace JSX {
    export function useFragment<T = unknown>(props: { children: any[] }): T[] {
        return Array.isArray(props.children) ? props.children.flat() : [props.children];
    }

    export function useElement(element: Function, props: Record<string, unknown>, ...children: unknown[]) {
        return element({ children, ...props });
    }
}
