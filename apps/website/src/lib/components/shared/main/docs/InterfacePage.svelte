<script lang="ts">
    import type { DocNodeInterface } from '@deno/doc';
    import NodeDocHeader from '../utils/NodeDocHeader.svelte';
    import TableOfContents from '../utils/TableOfContents.svelte';

    let {
        node
    }: {
        node: DocNodeInterface;
    } = $props();
</script>

<section class="mt-2">
    <NodeDocHeader {node}/>
    <TableOfContents {node}/>
</section>
