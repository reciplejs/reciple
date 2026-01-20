<script lang="ts">
    import type { DocNodeInterface } from '@deno/doc';
    import NodeDocHeader from '../utils/NodeDocHeader.svelte';

    let {
        node
    }: {
        node: DocNodeInterface;
    } = $props();
</script>

<NodeDocHeader {node}/>
