export function jsx(element: Function, props: Record<string, unknown>, ...children: unknown[]) {
    return element({
        children,
        ...props,
    });
}

export const jsxs = jsx;

export function Fragment(props: { children: unknown[] }): unknown[] {
    return Array.isArray(props.children) ? props.children.flat() : [props.children];
}
