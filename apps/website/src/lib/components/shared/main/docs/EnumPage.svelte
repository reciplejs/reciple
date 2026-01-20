<script lang="ts">
    import type { DocNodeEnum } from '@deno/doc';
    import NodeDocHeader from '../utils/NodeDocHeader.svelte';
    import TableOfContents from '../utils/TableOfContents.svelte';

    let {
        node
    }: {
        node: DocNodeEnum;
    } = $props();
</script>

<section class="mt-2 grid gap-2">
    <NodeDocHeader {node}/>
    <TableOfContents {node}/>
</section>
