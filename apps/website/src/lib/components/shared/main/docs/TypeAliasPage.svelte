<script lang="ts">
    import type { DocNodeTypeAlias } from '@deno/doc';
    import NodeDocHeader from '../utils/NodeDocHeader.svelte';

    let {
        node,
        tiny = false
    }: {
        node: DocNodeTypeAlias;
        tiny?: boolean;
    } = $props();
</script>

<section class="mt-2 grid gap-2">
    <NodeDocHeader {node} removeIcon={tiny}/>
</section>
