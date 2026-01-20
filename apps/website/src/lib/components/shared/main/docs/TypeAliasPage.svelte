<script lang="ts">
    import type { DocNodeTypeAlias } from '@deno/doc';
    import NodeDocHeader from '../utils/NodeDocHeader.svelte';

    let {
        node
    }: {
        node: DocNodeTypeAlias;
    } = $props();
</script>

<section class="mt-2 grid gap-2">
    <NodeDocHeader {node}/>
</section>
