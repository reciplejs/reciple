<script lang="ts">
    import type { DocNode, DocNodeNamespace } from '@deno/doc';
    import NodeDocHeader from '../utils/NodeDocHeader.svelte';
    import TableOfContents from '../utils/TableOfContents.svelte';
    import { documentationState } from '../../../../helpers/contexts';
    import { filterArrayDuplicate } from '../../../../helpers/utils';
    import ElementDoc from '../utils/ElementDoc.svelte';

    let {
        node,
        tiny = false
    }: {
        node: DocNodeNamespace;
        tiny?: boolean;
    } = $props();

    const docState = documentationState.get();

    let elements: DocNode[] = $derived(
        filterArrayDuplicate(
            node.namespaceDef.elements,
            (data) => data.items.findIndex(item => item.name === data.item.name && item.kind === data.item.kind) === data.index
        )
    );
</script>

<section class="mt-2 flex flex-col gap-2">
    <NodeDocHeader {node} removeIcon={tiny}/>
    <TableOfContents {elements} open={!tiny}/>
</section>

<section class="mt-2 flex flex-col gap-2">
    {#each elements as element}
        <ElementDoc {element} namespace={node}/>
    {/each}
</section>
