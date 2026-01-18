import type { DocNode, TsTypeParamDef } from '@deno/doc';
import { Humanized } from './classes/HumanizedNode.svelte';

export function humanizeNode(node: DocNode): string {
    return new Humanized().humanizeNode(node).toString();
}

export function humanizeTypeParams(params: TsTypeParamDef[]): string[] {
    const tokens: string[] = [];

    for (const param of params) {
        let token = param.name;

        if (param.constraint) {
            token += ` extends ${param.constraint}`;
        }
    }

    return tokens;
}
