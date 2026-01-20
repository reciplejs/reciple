<script lang="ts">
    import type { DocNodeVariable } from '@deno/doc';
    import NodeDocHeader from '../utils/NodeDocHeader.svelte';

    let {
        node
    }: {
        node: DocNodeVariable;
    } = $props();
</script>

<section class="mt-2 grid gap-2">
    <NodeDocHeader {node}/>
</section>
