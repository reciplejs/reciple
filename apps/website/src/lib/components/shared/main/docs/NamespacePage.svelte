<script lang="ts">
    import type { DocNodeNamespace } from '@deno/doc';
    import NodeDocHeader from '../utils/NodeDocHeader.svelte';

    let {
        node
    }: {
        node: DocNodeNamespace;
    } = $props();
</script>

<NodeDocHeader {node}/>
