<script lang="ts">
    import type { DocNodeVariable } from '@deno/doc';
    import NodeDocHeader from '../utils/NodeDocHeader.svelte';

    let {
        node
    }: {
        node: DocNodeVariable;
    } = $props();
</script>

<NodeDocHeader {node}/>
